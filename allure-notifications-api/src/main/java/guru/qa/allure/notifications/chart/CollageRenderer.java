package guru.qa.allure.notifications.chart;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.Shape;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.config.chart.ChartPanelItem;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.report.ReportAnalytics;
import lombok.extern.slf4j.Slf4j;

/**
 * Renders configured collage panels into a single PNG.
 *
 * <p>Each panel is drawn inside its own rounded "card" container with a visible
 * border and a gap around it, so the charts are visually separated instead of
 * bleeding into one another.
 *
 * <p>Grid layout (default): pie (top-left), testing pyramid or suites fallback (top-right),
 * durations (bottom).
 *
 * <p>Stacked layout ({@code chart.layout = "stacked"}): pie, pyramid, durations each full-width,
 * one under another — a single tall image.
 *
 * <p>Row layout ({@code chart.layout = "row"}): pie, pyramid, durations side by side in a single
 * horizontal row — a wide image.
 *
 * <p>Free layout ({@code chart.layout = "free"}): panels from {@code chart.items}
 * ({@code type,x,y,w,h}) on a {@code gridCols × gridRows} cell grid (CB-870 lossless).
 */
@Slf4j
public final class CollageRenderer {
    private static final int DEFAULT_WIDTH = 1000;
    private static final int DEFAULT_HEIGHT = 600;
    private static final int DEFAULT_GRID_COLS = 10;
    private static final int DEFAULT_GRID_ROWS = 10;
    private static final String LAYOUT_STACKED = "stacked";
    private static final String LAYOUT_ROW = "row";
    private static final String LAYOUT_FREE = "free";
    // Container ("card") geometry: gap around/between panels + corner radius.
    private static final int CARD_GAP = 14;
    private static final int CARD_ARC = 18;
    private static final float CARD_BORDER_WIDTH = 1.5f;
    // Header bar (like design-system .panel__bar): traffic-light dots + title.
    // Geometry (dot size / paddings / font) scales proportionally from BASE_HEADER_HEIGHT,
    // so a taller bar stays balanced and the caption reads at Telegram's downscaled size.
    // CANON_HEADER_HEIGHT is the default when chart.headerHeight is unset — the shared
    // canon with the design-system .zds-widget-bar (dashboard-overrides.css).
    private static final int BASE_HEADER_HEIGHT = 34;
    private static final int CANON_HEADER_HEIGHT = 68;
    private static final int CARD_HEADER_PAD_X = 14;
    // Indicator dots — mirror design-system tokens (--panel-dot-size 8, --panel-dot-gap 5)
    // and the .panel--content muted look (55% mix toward the header background).
    private static final int CARD_DOT_SIZE = 8;
    private static final int CARD_DOT_GAP = 5;
    private static final int CARD_DOT_TITLE_GAP = 8;
    private static final int CARD_TITLE_FONT = 12;
    private static final float CARD_DOT_MIX = 0.55f;
    private static final Color DOT_CLOSE = new Color(0xff5f57);
    private static final Color DOT_MINIMIZE = new Color(0xfebc2e);
    private static final Color DOT_MAXIMIZE = new Color(0x28c840);

    // Panel identifiers accepted in chart.panels (config order is preserved).
    private static final String PANEL_PIE = "pie";
    private static final String PANEL_PYRAMID = "testingpyramid";
    private static final String PANEL_DURATIONS = "durations";
    private static final String PANEL_STATUS_DYNAMICS = "statusdynamics";
    private static final String PANEL_SUCCESS_RATE = "successratedistribution";
    // Default grid: dashboard-style 2x2 (pie + pyramid on top, history charts below).
    private static final List<List<String>> DEFAULT_ROWS = Arrays.asList(
            Arrays.asList(PANEL_PIE, PANEL_PYRAMID),
            Arrays.asList(PANEL_STATUS_DYNAMICS, PANEL_SUCCESS_RATE));

    private CollageRenderer() {
    }

    /**
     * Normalised rows of panels to draw, honouring {@code chart.panels} order. Each inner
     * list is one horizontal row. Unknown ids are dropped; empty rows are removed; an
     * empty/absent config falls back to {@link #DEFAULT_ROWS}.
     */
    private static List<List<String>> selectedRows(ChartConfig chartConfig) {
        List<List<String>> configured = chartConfig != null ? chartConfig.getPanels() : null;
        if (configured == null || configured.isEmpty()) {
            return DEFAULT_ROWS;
        }
        List<List<String>> rows = new ArrayList<>();
        for (List<String> rawRow : configured) {
            if (rawRow == null) {
                continue;
            }
            List<String> row = new ArrayList<>();
            for (String raw : rawRow) {
                String norm = normalize(raw);
                if (norm != null) {
                    row.add(norm);
                }
            }
            if (!row.isEmpty()) {
                rows.add(row);
            }
        }
        return rows.isEmpty() ? DEFAULT_ROWS : rows;
    }

    /**
     * Maps a raw panel id (config value) to a canonical id, accepting English aliases and
     * the Russian dashboard titles. Returns {@code null} for unknown ids.
     */
    private static String normalize(String raw) {
        if (raw == null) {
            return null;
        }
        String key = raw.trim().toLowerCase(Locale.ROOT);
        if (PANEL_PIE.equals(key) || "currentstatus".equals(key)) {
            return PANEL_PIE;
        }
        if (PANEL_PYRAMID.equals(key) || "pyramid".equals(key)) {
            return PANEL_PYRAMID;
        }
        if (PANEL_DURATIONS.equals(key) || "duration".equals(key)) {
            return PANEL_DURATIONS;
        }
        if (PANEL_STATUS_DYNAMICS.equals(key) || "динамика статусов".equals(key)) {
            return PANEL_STATUS_DYNAMICS;
        }
        if (PANEL_SUCCESS_RATE.equals(key) || "распределение успешности".equals(key)) {
            return PANEL_SUCCESS_RATE;
        }
        return null;
    }

    /** Flattens rows into a single ordered list (for stacked / row layouts). */
    private static List<String> flatten(List<List<String>> rows) {
        List<String> flat = new ArrayList<>();
        for (List<String> row : rows) {
            flat.addAll(row);
        }
        return flat;
    }

    private static BufferedImage renderPanel(String key, Base base, int width, int height,
                                             ReportAnalytics analytics, Legend legend)
            throws MessageBuildException {
        // The card's header bar captions each panel, so panels skip their own title.
        PanelContext context = PanelContext.of(base, width, height, analytics, legend, false);
        if (PANEL_PIE.equals(key)) {
            return new PiePanel().render(context);
        }
        if (PANEL_PYRAMID.equals(key)) {
            return new TestingPyramidPanel().render(context);
        }
        if (PANEL_STATUS_DYNAMICS.equals(key)) {
            return new StatusDynamicsPanel().render(context);
        }
        if (PANEL_SUCCESS_RATE.equals(key)) {
            return new SuccessRateDistributionPanel().render(context);
        }
        return new DurationsPanel().render(context);
    }

    private static String panelTitle(String key, Base base, ReportAnalytics analytics) {
        if (PANEL_PIE.equals(key)) {
            return pieTitle(base);
        }
        if (PANEL_PYRAMID.equals(key)) {
            return topRightTitle(base, analytics);
        }
        if (PANEL_STATUS_DYNAMICS.equals(key)) {
            return "Динамика статусов";
        }
        if (PANEL_SUCCESS_RATE.equals(key)) {
            return "Распределение успешности";
        }
        return "Durations (s)";
    }

    /**
     * Resolves the title-bar height from {@code chart.headerHeight}, falling back to the
     * baseline. Every panel renders below the bar (no overlap), so a taller bar just adds
     * legible header space instead of clipping the chart underneath it.
     */
    private static int resolveHeaderHeight(ChartConfig chartConfig) {
        if (chartConfig != null && chartConfig.getHeaderHeight() != null && chartConfig.getHeaderHeight() > 0) {
            return chartConfig.getHeaderHeight();
        }
        return CANON_HEADER_HEIGHT;
    }

    public static byte[] render(Base base, ReportAnalytics analytics, Legend legend) throws MessageBuildException {
        ChartConfig chartConfig = base != null ? base.getChart() : null;
        int collageWidth = chartConfig != null && chartConfig.getWidth() != null
                ? chartConfig.getWidth()
                : DEFAULT_WIDTH;
        int collageHeight = chartConfig != null && chartConfig.getHeight() != null
                ? chartConfig.getHeight()
                : DEFAULT_HEIGHT;
        String layout = chartConfig != null && chartConfig.getLayout() != null
                ? chartConfig.getLayout()
                : "grid";
        int headerHeight = resolveHeaderHeight(chartConfig);

        if (LAYOUT_STACKED.equalsIgnoreCase(layout)) {
            return renderStacked(base, analytics, legend, collageWidth, collageHeight, headerHeight);
        }
        if (LAYOUT_ROW.equalsIgnoreCase(layout)) {
            return renderRow(base, analytics, legend, collageWidth, collageHeight, headerHeight);
        }
        if (LAYOUT_FREE.equalsIgnoreCase(layout)) {
            return renderFree(base, analytics, legend, collageWidth, collageHeight, headerHeight);
        }
        return renderGrid(base, analytics, legend, collageWidth, collageHeight, headerHeight);
    }

    /**
     * Free-grid: place each {@link ChartPanelItem} on a cell grid (default 10×10).
     * Pixel bounds = cell slots with the same CARD_GAP / half-gap inset as {@link #renderGrid}.
     */
    private static byte[] renderFree(Base base, ReportAnalytics analytics, Legend legend,
                                     int collageWidth, int collageHeight, int headerHeight)
            throws MessageBuildException {
        ChartConfig chartConfig = base != null ? base.getChart() : null;
        int cols = chartConfig != null && chartConfig.getGridCols() != null && chartConfig.getGridCols() > 0
                ? chartConfig.getGridCols()
                : DEFAULT_GRID_COLS;
        int rows = chartConfig != null && chartConfig.getGridRows() != null && chartConfig.getGridRows() > 0
                ? chartConfig.getGridRows()
                : DEFAULT_GRID_ROWS;
        List<ChartPanelItem> items = selectedFreeItems(chartConfig);
        int half = CARD_GAP / 2;
        int cellW = collageWidth / cols;
        int cellH = collageHeight / rows;

        ChartTheme theme = ChartTheme.from(base);
        BufferedImage collage = new BufferedImage(collageWidth, collageHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = collage.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(outerBackground(theme));
            graphics.fillRect(0, 0, collageWidth, collageHeight);

            for (ChartPanelItem item : items) {
                String key = normalize(item.getType());
                if (key == null) {
                    continue;
                }
                int x = clamp(item.getX(), 0, cols - 1);
                int y = clamp(item.getY(), 0, rows - 1);
                int w = Math.max(1, item.getW() == null ? 1 : item.getW());
                int h = Math.max(1, item.getH() == null ? 1 : item.getH());
                if (x + w > cols) {
                    w = cols - x;
                }
                if (y + h > rows) {
                    h = rows - y;
                }

                int rawLeft = x * cellW;
                int rawTop = y * cellH;
                int rawRight = (x + w) * cellW;
                int rawBottom = (y + h) * cellH;
                int cellLeft = x == 0 ? CARD_GAP : rawLeft + half;
                int cellTop = y == 0 ? CARD_GAP : rawTop + half;
                int cellRight = x + w == cols ? collageWidth - CARD_GAP : rawRight - half;
                int cellBottom = y + h == rows ? collageHeight - CARD_GAP : rawBottom - half;
                int cellWidth = Math.max(1, cellRight - cellLeft);
                int cellHeight = Math.max(1, cellBottom - cellTop);
                int bodyHeight = Math.max(1, cellHeight - headerHeight);
                BufferedImage panel = renderPanel(key, base, cellWidth, bodyHeight, analytics, legend);
                Rect rect = new Rect(cellLeft, cellTop, cellWidth, cellHeight);
                drawCard(graphics, panel, rect, theme, panelTitle(key, base, analytics), headerHeight);
            }
        } finally {
            graphics.dispose();
        }

        log.info("Collage chart is created ({}x{}, free, items={}, grid={}x{}).",
                collageWidth, collageHeight, items.size(), cols, rows);
        return ChartImageEncoder.toPngBytes(collage);
    }

    private static int clamp(Integer value, int min, int max) {
        if (value == null) {
            return min;
        }
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Valid free-grid items; falls back to CB-870-grid default when {@code items} is empty.
     */
    private static List<ChartPanelItem> selectedFreeItems(ChartConfig chartConfig) {
        List<ChartPanelItem> configured = chartConfig != null ? chartConfig.getItems() : null;
        List<ChartPanelItem> items = new ArrayList<>();
        if (configured != null) {
            for (ChartPanelItem raw : configured) {
                if (raw == null || normalize(raw.getType()) == null) {
                    continue;
                }
                items.add(raw);
            }
        }
        if (!items.isEmpty()) {
            return items;
        }
        // CB-870-grid default: pie | pyramid top 5×5, durations full-width 10×5 bottom.
        ChartPanelItem pie = new ChartPanelItem();
        pie.setType(PANEL_PIE);
        pie.setX(0);
        pie.setY(0);
        pie.setW(5);
        pie.setH(5);
        ChartPanelItem pyramid = new ChartPanelItem();
        pyramid.setType(PANEL_PYRAMID);
        pyramid.setX(5);
        pyramid.setY(0);
        pyramid.setW(5);
        pyramid.setH(5);
        ChartPanelItem durations = new ChartPanelItem();
        durations.setType(PANEL_DURATIONS);
        durations.setX(0);
        durations.setY(5);
        durations.setW(10);
        durations.setH(5);
        return Arrays.asList(pie, pyramid, durations);
    }

    private static byte[] renderRow(Base base, ReportAnalytics analytics, Legend legend,
                                    int collageWidth, int collageHeight, int headerHeight)
            throws MessageBuildException {
        List<String> panels = flatten(selectedRows(base != null ? base.getChart() : null));
        int count = panels.size();
        // Cards side by side: a gap on both edges and between each neighbour (count + 1 gaps).
        int colWidth = (collageWidth - (count + 1) * CARD_GAP) / count;
        int cardHeight = collageHeight - 2 * CARD_GAP;

        ChartTheme theme = ChartTheme.from(base);
        BufferedImage collage = new BufferedImage(collageWidth, collageHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = collage.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(outerBackground(theme));
            graphics.fillRect(0, 0, collageWidth, collageHeight);
            for (int i = 0; i < count; i++) {
                String key = panels.get(i);
                int bodyHeight = cardHeight - headerHeight;
                BufferedImage panel = renderPanel(key, base, colWidth, bodyHeight, analytics, legend);
                Rect rect = new Rect((i + 1) * CARD_GAP + i * colWidth, CARD_GAP, colWidth, cardHeight);
                drawCard(graphics, panel, rect, theme, panelTitle(key, base, analytics), headerHeight);
            }
        } finally {
            graphics.dispose();
        }

        log.info("Collage chart is created ({}x{}, row, panels={}).", collageWidth, collageHeight, panels);
        return ChartImageEncoder.toPngBytes(collage);
    }

    private static byte[] renderGrid(Base base, ReportAnalytics analytics, Legend legend,
                                     int collageWidth, int collageHeight, int headerHeight)
            throws MessageBuildException {
        List<List<String>> rows = selectedRows(base != null ? base.getChart() : null);
        int rowCount = rows.size();
        int half = CARD_GAP / 2;

        ChartTheme theme = ChartTheme.from(base);
        BufferedImage collage = new BufferedImage(collageWidth, collageHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = collage.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(outerBackground(theme));
            graphics.fillRect(0, 0, collageWidth, collageHeight);

            int rowSlot = collageHeight / rowCount;
            for (int r = 0; r < rowCount; r++) {
                List<String> row = rows.get(r);
                int cols = row.size();
                // Uniform gap around the collage; half-gap on each side between neighbours.
                int cellTop = r == 0 ? CARD_GAP : r * rowSlot + half;
                int cellBottom = r == rowCount - 1 ? collageHeight - CARD_GAP : (r + 1) * rowSlot - half;
                int cellHeight = Math.max(1, cellBottom - cellTop);
                int colSlot = collageWidth / cols;
                for (int c = 0; c < cols; c++) {
                    String key = row.get(c);
                    int cellLeft = c == 0 ? CARD_GAP : c * colSlot + half;
                    int cellRight = c == cols - 1 ? collageWidth - CARD_GAP : (c + 1) * colSlot - half;
                    int cellWidth = Math.max(1, cellRight - cellLeft);
                    // Every panel renders below the header bar so a taller bar never clips it.
                    int bodyHeight = cellHeight - headerHeight;
                    BufferedImage panel = renderPanel(key, base, cellWidth, bodyHeight, analytics, legend);
                    Rect rect = new Rect(cellLeft, cellTop, cellWidth, cellHeight);
                    drawCard(graphics, panel, rect, theme, panelTitle(key, base, analytics), headerHeight);
                }
            }
        } finally {
            graphics.dispose();
        }

        log.info("Collage chart is created ({}x{}, grid, rows={}).", collageWidth, collageHeight, rows);
        return ChartImageEncoder.toPngBytes(collage);
    }

    private static byte[] renderStacked(Base base, ReportAnalytics analytics, Legend legend,
                                        int collageWidth, int collageHeight, int headerHeight)
            throws MessageBuildException {
        List<String> panels = flatten(selectedRows(base != null ? base.getChart() : null));
        // Each panel keeps the full configured height at full width so nothing is squished.
        int panelHeight = collageHeight;
        int cardWidth = collageWidth - 2 * CARD_GAP;
        int cardHeight = panelHeight - CARD_GAP;

        int totalHeight = panelHeight * panels.size();
        ChartTheme theme = ChartTheme.from(base);
        BufferedImage collage = new BufferedImage(collageWidth, totalHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = collage.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(outerBackground(theme));
            graphics.fillRect(0, 0, collageWidth, totalHeight);
            for (int i = 0; i < panels.size(); i++) {
                String key = panels.get(i);
                int bodyHeight = cardHeight - headerHeight;
                BufferedImage panel = renderPanel(key, base, cardWidth, bodyHeight, analytics, legend);
                Rect rect = new Rect(CARD_GAP, panelHeight * i + CARD_GAP, cardWidth, cardHeight);
                drawCard(graphics, panel, rect, theme, panelTitle(key, base, analytics), headerHeight);
            }
        } finally {
            graphics.dispose();
        }

        log.info("Collage chart is created ({}x{}, stacked, panels={}).", collageWidth, totalHeight, panels);
        return ChartImageEncoder.toPngBytes(collage);
    }

    /**
     * Draws a panel clipped to a rounded rectangle, overlays a header bar (muted
     * traffic-light dots + title) and strokes a border around it — a self-contained
     * "card" container modelled on the design-system {@code .panel--content}. The bar
     * geometry (dots, paddings, font) scales with {@code headerHeight} so a taller bar
     * stays balanced and the caption reads at Telegram's downscaled size.
     */
    private static void drawCard(Graphics2D graphics, BufferedImage panel, Rect rect, ChartTheme theme,
                                 String title, int headerHeight) {
        double scale = headerHeight / (double) BASE_HEADER_HEIGHT;
        int padX = Math.max(CARD_HEADER_PAD_X, (int) Math.round(CARD_HEADER_PAD_X * scale));
        int dotSize = Math.max(CARD_DOT_SIZE, (int) Math.round(CARD_DOT_SIZE * scale));
        int dotGap = Math.max(CARD_DOT_GAP, (int) Math.round(CARD_DOT_GAP * scale));
        int dotTitleGap = Math.max(CARD_DOT_TITLE_GAP, (int) Math.round(CARD_DOT_TITLE_GAP * scale));
        int fontSize = Math.max(CARD_TITLE_FONT, (int) Math.round(CARD_TITLE_FONT * scale));

        Shape previousClip = graphics.getClip();
        RoundRectangle2D card = new RoundRectangle2D.Float(rect.x, rect.y, rect.w, rect.h, CARD_ARC, CARD_ARC);
        graphics.setClip(card);
        graphics.drawImage(panel, rect.x, rect.y + headerHeight, null);

        // Header bar — covers the panel's own top title and replaces it with the
        // canonical .panel bar: muted traffic-light indicators + a single caption.
        Color headerBg = headerBackground(theme);
        graphics.setColor(headerBg);
        graphics.fillRect(rect.x, rect.y, rect.w, headerHeight);
        graphics.setColor(cardBorder(theme));
        graphics.setStroke(new BasicStroke(1f));
        graphics.drawLine(rect.x, rect.y + headerHeight, rect.x + rect.w, rect.y + headerHeight);

        int dotY = rect.y + (headerHeight - dotSize) / 2;
        int dotX = rect.x + padX;
        for (Color dot : new Color[] {DOT_CLOSE, DOT_MINIMIZE, DOT_MAXIMIZE}) {
            graphics.setColor(mix(dot, headerBg, CARD_DOT_MIX));
            graphics.fillOval(dotX, dotY, dotSize, dotSize);
            dotX += dotSize + dotGap;
        }
        int dotsWidth = 3 * dotSize + 2 * dotGap;

        if (title != null && !title.isEmpty()) {
            graphics.setColor(headerText(theme));
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, fontSize));
            FontMetrics metrics = graphics.getFontMetrics();
            int baseline = rect.y + (headerHeight + metrics.getAscent() - metrics.getDescent()) / 2;
            int titleX = rect.x + padX + dotsWidth + dotTitleGap;
            graphics.drawString(title, titleX, baseline);
        }
        graphics.setClip(previousClip);

        graphics.setColor(cardBorder(theme));
        graphics.setStroke(new BasicStroke(CARD_BORDER_WIDTH));
        graphics.draw(new RoundRectangle2D.Float(
                rect.x + 0.5f, rect.y + 0.5f, rect.w - 1f, rect.h - 1f, CARD_ARC, CARD_ARC));
    }

    private static String pieTitle(Base base) {
        String project = base != null ? base.getProject() : null;
        return project != null && !project.isEmpty() ? project : "Summary";
    }

    private static String topRightTitle(Base base, ReportAnalytics analytics) {
        TestingPyramidPanel.LayerBreakdown breakdown =
                TestingPyramidPanel.LayerBreakdown.from(analytics.getLayers());
        String fallback = base != null && base.getChart() != null && base.getChart().getPyramidFallback() != null
                ? base.getChart().getPyramidFallback()
                : "suites";
        if (!breakdown.hasKnownLayers() && "suites".equalsIgnoreCase(fallback)) {
            return "Suites";
        }
        return "Testing pyramid";
    }

    private static Color outerBackground(ChartTheme theme) {
        return theme.isDark() ? new Color(34, 34, 34) : new Color(240, 240, 242);
    }

    private static Color cardBorder(ChartTheme theme) {
        return theme.isDark() ? new Color(96, 96, 96) : new Color(210, 210, 214);
    }

    private static Color headerBackground(ChartTheme theme) {
        return theme.isDark() ? new Color(60, 60, 60) : new Color(247, 247, 249);
    }

    private static Color headerText(ChartTheme theme) {
        return theme.isDark() ? new Color(180, 180, 180) : new Color(90, 90, 90);
    }

    /**
     * Blends {@code color} toward {@code background} by {@code weight} — the opaque
     * equivalent of CSS {@code color-mix(in srgb, color 55%, transparent)} composited
     * over the header bar.
     */
    private static Color mix(Color color, Color background, float weight) {
        float rest = 1f - weight;
        int r = Math.round(color.getRed() * weight + background.getRed() * rest);
        int g = Math.round(color.getGreen() * weight + background.getGreen() * rest);
        int b = Math.round(color.getBlue() * weight + background.getBlue() * rest);
        return new Color(r, g, b);
    }

    private static final class Rect {
        private final int x;
        private final int y;
        private final int w;
        private final int h;

        private Rect(int x, int y, int w, int h) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
    }
}
