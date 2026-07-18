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
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.AllureResultsReader;
import guru.qa.allure.notifications.report.LocatedReport;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.ReportAnalyticsBuilder;
import guru.qa.allure.notifications.report.ReportLocator;
import guru.qa.allure.notifications.report.SummaryReader;

/**
 * Local visual preview (not an assertion suite).
 * <pre>
 * ./gradlew :allure-notifications-api:test --tests PyramidPreviewMain
 * open allure-notifications-api/build/pyramid-preview
 * </pre>
 */
class PyramidPreviewMain {

    private enum HeaderStyle { PLAIN, ACCENT_LEFT, ICON, BADGE }

    // Status -> dot color. "blue" is an extra info dot (no matching Allure status).
    private static final Color DOT_RED = ChartTheme.STATUS_FAILED;
    private static final Color DOT_YELLOW = ChartTheme.STATUS_BROKEN;
    private static final Color DOT_PURPLE = ChartTheme.STATUS_UNKNOWN;
    private static final Color DOT_GREEN = ChartTheme.STATUS_PASSED;
    private static final Color DOT_GRAY = ChartTheme.STATUS_SKIPPED;
    private static final Color DOT_BLUE = new Color(97, 182, 251);
    private static final int CARD_GAP = 14;
    private static final int CARD_ARC = 18;

    @Test
    void generatePreviewPngs() throws Exception {
        Path moduleDir = Paths.get("").toAbsolutePath();
        if (!Files.isDirectory(moduleDir.resolve("src/test/resources/fixtures"))) {
            moduleDir = moduleDir.resolve("allure-notifications-api");
        }
        Path outDir = moduleDir.resolve("build/pyramid-preview");
        Files.createDirectories(outDir);

        Path fixturesRoot = moduleDir.resolve("src/test/resources/fixtures");
        Path a3Report = fixturesRoot.resolve("allure3-report");
        Path richResults = outDir.resolve("rich-results");
        writeRichResults(richResults);

        renderAll(outDir, a3Report, fixturesRoot.resolve("allure-results"), "fixture3layers");
        renderAll(outDir, a3Report, richResults, "allLayers");

        System.out.println("Wrote preview PNGs to " + outDir.toAbsolutePath());
    }

    /**
     * Header-card preview: a single indicator wrapped in a collage-styled card
     * (same outer background / border / corner radius) with a header bar on top.
     * One card = one indicator (donut, pyramid).
     */
    @Test
    void generateHeaderCardPngs() throws Exception {
        Path moduleDir = Paths.get("").toAbsolutePath();
        if (!Files.isDirectory(moduleDir.resolve("src/test/resources/fixtures"))) {
            moduleDir = moduleDir.resolve("allure-notifications-api");
        }
        Path outDir = moduleDir.resolve("build/pyramid-preview");
        Files.createDirectories(outDir);

        Path fixturesRoot = moduleDir.resolve("src/test/resources/fixtures");
        Path a3Report = fixturesRoot.resolve("allure3-report");
        Path richResults = outDir.resolve("rich-results");
        writeRichResults(richResults);

        int cardWidth = 460;
        int cardHeight = 460;
        int headerHeight = 46;
        int bodyWidth = cardWidth - 2 * CARD_GAP;
        int bodyHeight = cardHeight - 2 * CARD_GAP - headerHeight;

        for (boolean dark : new boolean[] {false, true}) {
            Base base = base(a3Report, richResults, dark);
            LocatedReport located = ReportLocator.locate(a3Report);
            Summary summary = SummaryReader.read(new JSON(), located);
            Legend legend = new JSON().parseResource("/legend/en.json", Legend.class);
            ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);
            ChartTheme theme = ChartTheme.from(base);
            String mode = dark ? "dark" : "light";

            BufferedImage pie = new PiePanel().render(
                    PanelContext.of(base, bodyWidth, bodyHeight, analytics, legend));
            BufferedImage pyramid = new TestingPyramidPanel().render(
                    PanelContext.of(base, bodyWidth, bodyHeight, analytics, legend));

            Statistic statistic = analytics.getStatistic();
            int passed = statistic != null && statistic.getPassed() != null ? statistic.getPassed() : 0;
            int total = statistic != null && statistic.getTotal() != null ? statistic.getTotal() : 0;
            int passRate = total > 0 ? (int) Math.round(passed * 100.0 / total) : 0;
            String pieBadge = passRate + "% PASS";
            String pyramidBadge = layerCount(analytics.getLayers()) + " LAYERS";

            BufferedImage pieCard = headerCardStyled("Pass rate", pie, theme,
                    cardWidth, cardHeight, headerHeight, false,
                    HeaderStyle.BADGE, ChartTheme.STATUS_PASSED, pieBadge);
            BufferedImage pyramidCard = headerCardStyled("Testing pyramid", pyramid, theme,
                    cardWidth, cardHeight, headerHeight, true,
                    HeaderStyle.BADGE, ChartTheme.STATUS_SKIPPED, pyramidBadge);

            ImageIO.write(pieCard, "png",
                    outDir.resolve("header-card-pie-" + mode + ".png").toFile());
            ImageIO.write(pyramidCard, "png",
                    outDir.resolve("header-card-pyramid-" + mode + ".png").toFile());

            BufferedImage row = new BufferedImage(cardWidth * 2, cardHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D rowGraphics = row.createGraphics();
            try {
                rowGraphics.drawImage(pieCard, 0, 0, null);
                rowGraphics.drawImage(pyramidCard, cardWidth, 0, null);
            } finally {
                rowGraphics.dispose();
            }
            ImageIO.write(row, "png", outDir.resolve("header-cards-" + mode + ".png").toFile());

            System.out.println("Header cards " + mode + " -> header-cards-" + mode + ".png");
        }
    }

    /**
     * Status-priority dots for the header traffic-lights.
     *
     * <p>Success (no red/yellow/purple): green, gray, blue (each if present).
     *
     * <p>Failed build (any red/yellow/purple): red, yellow, purple, gray, blue
     * (green is dropped).
     */
    private static List<Color> priorityDots(int passed, int failed, int broken,
                                            int unknown, int skipped, int blue) {
        boolean failedBuild = failed > 0 || broken > 0 || unknown > 0;
        List<Color> dots = new ArrayList<>();
        if (failedBuild) {
            if (failed > 0) {
                dots.add(DOT_RED);
            }
            if (broken > 0) {
                dots.add(DOT_YELLOW);
            }
            if (unknown > 0) {
                dots.add(DOT_PURPLE);
            }
            if (skipped > 0) {
                dots.add(DOT_GRAY);
            }
            if (blue > 0) {
                dots.add(DOT_BLUE);
            }
        } else {
            if (passed > 0) {
                dots.add(DOT_GREEN);
            }
            if (skipped > 0) {
                dots.add(DOT_GRAY);
            }
            if (blue > 0) {
                dots.add(DOT_BLUE);
            }
        }
        return dots;
    }

    /**
     * Grid of status-priority dot scenarios so the header traffic-light ordering
     * can be verified across success / failed-build cases.
     */
    @Test
    void generateHeaderDotsPngs() throws Exception {
        Path moduleDir = Paths.get("").toAbsolutePath();
        if (!Files.isDirectory(moduleDir.resolve("src/test/resources/fixtures"))) {
            moduleDir = moduleDir.resolve("allure-notifications-api");
        }
        Path outDir = moduleDir.resolve("build/pyramid-preview");
        Files.createDirectories(outDir);

        int cardWidth = 460;
        int cardHeight = 128;
        int headerHeight = 46;

        // {label, passed, failed, broken, unknown, skipped, blue}
        int[][] counts = {
                {0, 10, 0, 0, 0, 0, 0},
                {1, 8, 0, 0, 0, 2, 0},
                {2, 8, 0, 0, 0, 1, 1},
                {3, 6, 2, 0, 0, 2, 0},
                {4, 5, 1, 1, 0, 1, 0},
                {5, 3, 1, 1, 1, 1, 1},
        };
        String[] labels = {
            "All passed",
            "Passed + skipped",
            "Passed + skipped + info",
            "Failed build (green dropped)",
            "Failed + broken + skipped",
            "Full: red+yellow+purple+gray+blue",
        };

        for (boolean dark : new boolean[] {false, true}) {
            ChartTheme theme = ChartTheme.from(baseTheme(dark));
            String mode = dark ? "dark" : "light";
            BufferedImage[] cards = new BufferedImage[counts.length];
            for (int i = 0; i < counts.length; i++) {
                int passed = counts[i][1];
                int failed = counts[i][2];
                int broken = counts[i][3];
                int unknown = counts[i][4];
                int skipped = counts[i][5];
                int blue = counts[i][6];
                List<Color> dots = priorityDots(passed, failed, broken, unknown, skipped, blue);
                String subtitle = summaryLine(passed, failed, broken, unknown, skipped, blue);
                cards[i] = dotsCard(labels[i], subtitle, dots, theme,
                        cardWidth, cardHeight, headerHeight);
            }

            int cols = 2;
            int rows = (counts.length + cols - 1) / cols;
            BufferedImage grid = new BufferedImage(cardWidth * cols, cardHeight * rows,
                    BufferedImage.TYPE_INT_RGB);
            Graphics2D gridGraphics = grid.createGraphics();
            try {
                for (int i = 0; i < cards.length; i++) {
                    int col = i % cols;
                    int rowIndex = i / cols;
                    gridGraphics.drawImage(cards[i], col * cardWidth, rowIndex * cardHeight, null);
                }
            } finally {
                gridGraphics.dispose();
            }
            ImageIO.write(grid, "png", outDir.resolve("header-dots-" + mode + ".png").toFile());
            System.out.println("Header dots " + mode + " -> header-dots-" + mode + ".png");
        }
    }

    private static Base baseTheme(boolean dark) {
        Base base = new Base();
        base.setDarkMode(dark);
        return base;
    }

    private static String summaryLine(int passed, int failed, int broken,
                                      int unknown, int skipped, int blue) {
        List<String> parts = new ArrayList<>();
        if (passed > 0) {
            parts.add("passed " + passed);
        }
        if (failed > 0) {
            parts.add("failed " + failed);
        }
        if (broken > 0) {
            parts.add("broken " + broken);
        }
        if (unknown > 0) {
            parts.add("unknown " + unknown);
        }
        if (skipped > 0) {
            parts.add("skipped " + skipped);
        }
        if (blue > 0) {
            parts.add("info " + blue);
        }
        return String.join("  ·  ", parts);
    }

    private static BufferedImage dotsCard(String title, String subtitle, List<Color> dots,
                                          ChartTheme theme, int cardWidth, int cardHeight,
                                          int headerHeight) {
        boolean dark = theme.isDark();
        Color outerBackground = dark ? new Color(34, 34, 34) : new Color(240, 240, 242);
        Color border = dark ? new Color(96, 96, 96) : new Color(210, 210, 214);
        Color headerBackground = dark ? new Color(43, 43, 43) : new Color(247, 247, 249);
        Color divider = dark ? new Color(72, 72, 72) : new Color(224, 226, 230);
        Color muted = dark ? new Color(150, 150, 150) : new Color(120, 128, 140);

        BufferedImage image = new BufferedImage(cardWidth, cardHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                    RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            graphics.setColor(outerBackground);
            graphics.fillRect(0, 0, cardWidth, cardHeight);

            int x = CARD_GAP;
            int y = CARD_GAP;
            int width = cardWidth - 2 * CARD_GAP;
            int height = cardHeight - 2 * CARD_GAP;

            Shape previousClip = graphics.getClip();
            graphics.setClip(new RoundRectangle2D.Float(x, y, width, height, CARD_ARC, CARD_ARC));

            graphics.setColor(theme.getBackground());
            graphics.fillRect(x, y, width, height);

            graphics.setColor(headerBackground);
            graphics.fillRect(x, y, width, headerHeight);
            graphics.setColor(divider);
            graphics.fillRect(x, y + headerHeight - 1, width, 1);

            int dotDiameter = 12;
            int dotStep = 20;
            int dotY = y + (headerHeight - dotDiameter) / 2;
            int dotX = x + 16;
            for (Color dot : dots) {
                graphics.setColor(dot);
                graphics.fillOval(dotX, dotY, dotDiameter, dotDiameter);
                graphics.setColor(dot.darker());
                graphics.drawOval(dotX, dotY, dotDiameter, dotDiameter);
                dotX += dotStep;
            }

            int titleX = dots.isEmpty() ? x + 16 : dotX + 8;
            graphics.setColor(theme.getText());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
            FontMetrics metrics = graphics.getFontMetrics();
            int baseline = y + (headerHeight + metrics.getAscent() - metrics.getDescent()) / 2;
            graphics.drawString(title, titleX, baseline);

            graphics.setColor(muted);
            graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
            FontMetrics subMetrics = graphics.getFontMetrics();
            graphics.drawString(subtitle, x + 16,
                    y + headerHeight + (height - headerHeight + subMetrics.getAscent()) / 2);

            graphics.setClip(previousClip);
            graphics.setColor(border);
            graphics.setStroke(new BasicStroke(1.5f));
            graphics.draw(new RoundRectangle2D.Float(
                    x + 0.5f, y + 0.5f, width - 1f, height - 1f, CARD_ARC, CARD_ARC));
        } finally {
            graphics.dispose();
        }
        return image;
    }

    /**
     * Renders a 2x2 grid of header-bar style variants on the same indicator (donut),
     * so the header treatments can be compared side by side.
     */
    @Test
    void generateHeaderVariantPngs() throws Exception {
        Path moduleDir = Paths.get("").toAbsolutePath();
        if (!Files.isDirectory(moduleDir.resolve("src/test/resources/fixtures"))) {
            moduleDir = moduleDir.resolve("allure-notifications-api");
        }
        Path outDir = moduleDir.resolve("build/pyramid-preview");
        Files.createDirectories(outDir);

        Path fixturesRoot = moduleDir.resolve("src/test/resources/fixtures");
        Path a3Report = fixturesRoot.resolve("allure3-report");
        Path richResults = outDir.resolve("rich-results");
        writeRichResults(richResults);

        int cardWidth = 440;
        int cardHeight = 400;
        int headerHeight = 46;
        int bodyWidth = cardWidth - 2 * CARD_GAP;
        int bodyHeight = cardHeight - 2 * CARD_GAP - headerHeight;
        Color accent = ChartTheme.STATUS_PASSED;

        for (boolean dark : new boolean[] {false, true}) {
            Base base = base(a3Report, richResults, dark);
            LocatedReport located = ReportLocator.locate(a3Report);
            Summary summary = SummaryReader.read(new JSON(), located);
            Legend legend = new JSON().parseResource("/legend/en.json", Legend.class);
            ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);
            ChartTheme theme = ChartTheme.from(base);
            String mode = dark ? "dark" : "light";

            BufferedImage body = new PiePanel().render(
                    PanelContext.of(base, bodyWidth, bodyHeight, analytics, legend));

            HeaderStyle[] styles = {
                HeaderStyle.PLAIN, HeaderStyle.ACCENT_LEFT, HeaderStyle.ICON, HeaderStyle.BADGE
            };
            BufferedImage[] cards = new BufferedImage[styles.length];
            for (int i = 0; i < styles.length; i++) {
                cards[i] = headerCardStyled("Pass rate", body, theme,
                        cardWidth, cardHeight, headerHeight, false, styles[i], accent, "80% PASS");
            }

            BufferedImage grid = new BufferedImage(cardWidth * 2, cardHeight * 2, BufferedImage.TYPE_INT_RGB);
            Graphics2D gridGraphics = grid.createGraphics();
            try {
                gridGraphics.drawImage(cards[0], 0, 0, null);
                gridGraphics.drawImage(cards[1], cardWidth, 0, null);
                gridGraphics.drawImage(cards[2], 0, cardHeight, null);
                gridGraphics.drawImage(cards[3], cardWidth, cardHeight, null);
            } finally {
                gridGraphics.dispose();
            }
            ImageIO.write(grid, "png", outDir.resolve("header-variants-" + mode + ".png").toFile());
            System.out.println("Header variants " + mode + " -> header-variants-" + mode + ".png");
        }
    }

    private static int layerCount(Map<String, Integer> layers) {
        if (layers == null) {
            return 0;
        }
        Set<String> known = new HashSet<>();
        int unknown = 0;
        for (Map.Entry<String, Integer> entry : layers.entrySet()) {
            Integer count = entry.getValue();
            if (count == null || count <= 0) {
                continue;
            }
            if (PyramidLayerColors.isKnownLayer(entry.getKey())) {
                known.add(entry.getKey().trim().toLowerCase(Locale.ROOT));
            } else {
                unknown += count;
            }
        }
        return known.size() + (unknown > 0 ? 1 : 0);
    }

    private static BufferedImage headerCardStyled(String title, BufferedImage body, ChartTheme theme,
                                                  int cardWidth, int cardHeight, int headerHeight,
                                                  boolean eraseBodyTitle, HeaderStyle style,
                                                  Color accent, String badgeText) {
        boolean dark = theme.isDark();
        Color outerBackground = dark ? new Color(34, 34, 34) : new Color(240, 240, 242);
        Color border = dark ? new Color(96, 96, 96) : new Color(210, 210, 214);
        Color headerBackground = dark ? new Color(43, 43, 43) : new Color(247, 247, 249);
        Color divider = dark ? new Color(72, 72, 72) : new Color(224, 226, 230);

        BufferedImage image = new BufferedImage(cardWidth, cardHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                    RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            graphics.setColor(outerBackground);
            graphics.fillRect(0, 0, cardWidth, cardHeight);

            int x = CARD_GAP;
            int y = CARD_GAP;
            int width = cardWidth - 2 * CARD_GAP;
            int height = cardHeight - 2 * CARD_GAP;
            int bodyY = y + headerHeight;

            Shape previousClip = graphics.getClip();
            graphics.setClip(new RoundRectangle2D.Float(x, y, width, height, CARD_ARC, CARD_ARC));

            graphics.setColor(theme.getBackground());
            graphics.fillRect(x, y, width, height);

            graphics.drawImage(body, x, bodyY, null);
            if (eraseBodyTitle) {
                graphics.setColor(theme.getBackground());
                graphics.fillRect(x, bodyY, width, 34);
            }

            graphics.setColor(headerBackground);
            graphics.fillRect(x, y, width, headerHeight);

            if (style == HeaderStyle.ACCENT_LEFT) {
                graphics.setColor(divider);
                graphics.fillRect(x, y + headerHeight - 1, width, 1);
                graphics.setColor(accent);
                graphics.fillRect(x, y, 5, height);
            } else {
                graphics.setColor(divider);
                graphics.fillRect(x, y + headerHeight - 1, width, 1);
            }

            int titleX = x + 16;
            if (style == HeaderStyle.ACCENT_LEFT) {
                titleX = x + 20;
            }
            if (style == HeaderStyle.ICON) {
                int iconSize = 18;
                int iconY = y + (headerHeight - iconSize) / 2;
                graphics.setColor(accent);
                graphics.fillRoundRect(x + 16, iconY, iconSize, iconSize, 6, 6);
                titleX = x + 16 + iconSize + 10;
            }

            graphics.setColor(theme.getText());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 15));
            FontMetrics metrics = graphics.getFontMetrics();
            int baseline = y + (headerHeight + metrics.getAscent() - metrics.getDescent()) / 2;
            graphics.drawString(title, titleX, baseline);

            if (style == HeaderStyle.BADGE && badgeText != null) {
                graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 12));
                FontMetrics badgeMetrics = graphics.getFontMetrics();
                int textWidth = badgeMetrics.stringWidth(badgeText);
                int padX = 12;
                int pillWidth = textWidth + padX * 2;
                int pillHeight = 24;
                int pillX = x + width - 16 - pillWidth;
                int pillY = y + (headerHeight - pillHeight) / 2;
                graphics.setColor(accent);
                graphics.fillRoundRect(pillX, pillY, pillWidth, pillHeight, pillHeight, pillHeight);
                double luminance = (0.299 * accent.getRed() + 0.587 * accent.getGreen()
                        + 0.114 * accent.getBlue()) / 255.0;
                graphics.setColor(luminance > 0.6 ? Color.BLACK : Color.WHITE);
                int badgeBaseline = pillY + (pillHeight + badgeMetrics.getAscent()
                        - badgeMetrics.getDescent()) / 2;
                graphics.drawString(badgeText, pillX + padX, badgeBaseline);
            }

            graphics.setClip(previousClip);
            graphics.setColor(border);
            graphics.setStroke(new BasicStroke(1.5f));
            graphics.draw(new RoundRectangle2D.Float(
                    x + 0.5f, y + 0.5f, width - 1f, height - 1f, CARD_ARC, CARD_ARC));
        } finally {
            graphics.dispose();
        }
        return image;
    }

    private static BufferedImage headerCard(String title, BufferedImage body, ChartTheme theme,
                                            int cardWidth, int cardHeight, int headerHeight,
                                            boolean eraseBodyTitle) {
        boolean dark = theme.isDark();
        Color outerBackground = dark ? new Color(34, 34, 34) : new Color(240, 240, 242);
        Color border = dark ? new Color(96, 96, 96) : new Color(210, 210, 214);
        Color headerBackground = dark ? new Color(43, 43, 43) : new Color(247, 247, 249);
        Color divider = dark ? new Color(72, 72, 72) : new Color(224, 226, 230);

        BufferedImage image = new BufferedImage(cardWidth, cardHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                    RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            graphics.setColor(outerBackground);
            graphics.fillRect(0, 0, cardWidth, cardHeight);

            int x = CARD_GAP;
            int y = CARD_GAP;
            int width = cardWidth - 2 * CARD_GAP;
            int height = cardHeight - 2 * CARD_GAP;
            int bodyY = y + headerHeight;

            Shape previousClip = graphics.getClip();
            graphics.setClip(new RoundRectangle2D.Float(x, y, width, height, CARD_ARC, CARD_ARC));

            graphics.setColor(theme.getBackground());
            graphics.fillRect(x, y, width, height);

            graphics.drawImage(body, x, bodyY, null);
            if (eraseBodyTitle) {
                // Hide the panel's own top title so only the header bar names the card.
                graphics.setColor(theme.getBackground());
                graphics.fillRect(x, bodyY, width, 34);
            }

            graphics.setColor(headerBackground);
            graphics.fillRect(x, y, width, headerHeight);
            graphics.setColor(divider);
            graphics.fillRect(x, y + headerHeight - 1, width, 1);

            graphics.setColor(theme.getText());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 15));
            FontMetrics metrics = graphics.getFontMetrics();
            int baseline = y + (headerHeight + metrics.getAscent() - metrics.getDescent()) / 2;
            graphics.drawString(title, x + 16, baseline);

            graphics.setClip(previousClip);
            graphics.setColor(border);
            graphics.setStroke(new BasicStroke(1.5f));
            graphics.draw(new RoundRectangle2D.Float(
                    x + 0.5f, y + 0.5f, width - 1f, height - 1f, CARD_ARC, CARD_ARC));
        } finally {
            graphics.dispose();
        }
        return image;
    }

    private static void renderAll(Path outDir, Path a3Report, Path results, String prefix) throws Exception {
        Path historyFile = outDir.resolve("preview-history.jsonl");
        writeHistoryFixture(historyFile);
        for (boolean dark : new boolean[] {false, true}) {
            Base base = base(a3Report, results, dark);
            base.getChart().setHistoryPath(historyFile.toAbsolutePath().toString());
            LocatedReport located = ReportLocator.locate(a3Report);
            Summary summary = SummaryReader.read(new JSON(), located);
            Legend legend = new JSON().parseResource("/legend/en.json", Legend.class);
            ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

            byte[] collage = CollageRenderer.render(base, analytics, legend);
            String mode = dark ? "dark" : "light";
            Path collagePath = outDir.resolve(prefix + "-collage-" + mode + ".png");
            Files.write(collagePath, collage);

            base.getChart().setLayout("stacked");
            byte[] stacked = CollageRenderer.render(base, analytics, legend);
            Path stackedPath = outDir.resolve(prefix + "-collage-stacked-" + mode + ".png");
            Files.write(stackedPath, stacked);
            base.getChart().setLayout("grid");

            BufferedImage pyramid = new TestingPyramidPanel().render(
                    PanelContext.of(base, 500, 400, analytics, legend));
            Path pyramidPath = outDir.resolve(prefix + "-pyramid-" + mode + ".png");
            ImageIO.write(pyramid, "png", pyramidPath.toFile());

            System.out.println(prefix + " " + mode
                    + " layers=" + analytics.getLayers()
                    + " known=" + analytics.hasKnownLayerLabels()
                    + " -> " + collagePath.getFileName() + ", " + pyramidPath.getFileName());
        }
    }

    private static Base base(Path report, Path results, boolean dark) {
        Base base = new Base();
        base.setProject("Allure 3 preview");
        base.setAllureFolder(report.toAbsolutePath().toString());
        base.setAllureResultsFolder(results.toAbsolutePath().toString());
        base.setDarkMode(dark);
        ChartConfig chart = new ChartConfig();
        chart.setMode("collage");
        chart.setWidth(1000);
        chart.setHeight(600);
        chart.setPyramidFallback("suites");
        base.setChart(chart);
        return base;
    }

    private static void writeRichResults(Path dir) throws Exception {
        if (Files.exists(dir)) {
            Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (Exception ignored) {
                            // best-effort cleanup
                        }
                    });
        }
        Files.createDirectories(dir);
        String[][] rows = {
                {"unit", "passed", "UnitSuite", "5"},
                {"unit", "passed", "UnitSuite", "8"},
                {"unit", "failed", "UnitSuite", "12"},
                {"component", "passed", "ComponentSuite", "20"},
                {"component", "passed", "ComponentSuite", "25"},
                {"integration", "passed", "IntegrationSuite", "40"},
                {"integration", "broken", "IntegrationSuite", "55"},
                {"api", "passed", "ApiSuite", "30"},
                {"e2e", "passed", "E2ESuite", "90"},
                {"e2e", "failed", "E2ESuite", "120"},
                {"manual", "skipped", "ManualSuite", "10"},
                {"visual", "passed", "VisualSuite", "15"},
        };
        int i = 0;
        for (String[] row : rows) {
            i++;
            String layer = row[0];
            String status = row[1];
            String suite = row[2];
            long dur = Long.parseLong(row[3]);
            long start = 1_000_000L + i * 1000L;
            String uuid = UUID.nameUUIDFromBytes(("preview-" + i).getBytes(StandardCharsets.UTF_8)).toString();
            String json = "{\n"
                    + "  \"uuid\": \"" + uuid + "\",\n"
                    + "  \"name\": \"" + layer + "Case" + i + "\",\n"
                    + "  \"fullName\": \"com.example." + suite + "." + layer + "Case" + i + "\",\n"
                    + "  \"status\": \"" + status + "\",\n"
                    + "  \"start\": " + start + ",\n"
                    + "  \"stop\": " + (start + dur) + ",\n"
                    + "  \"labels\": [\n"
                    + "    {\"name\": \"layer\", \"value\": \"" + layer + "\"},\n"
                    + "    {\"name\": \"suite\", \"value\": \"" + suite + "\"}\n"
                    + "  ]\n"
                    + "}\n";
            Files.write(dir.resolve(uuid + "-result.json"), json.getBytes(StandardCharsets.UTF_8));
        }
        System.out.println("Rich results count=" + AllureResultsReader.read(dir).size());
    }

    /**
     * Writes a synthetic Allure 3 {@code history.jsonl} (one line per run) so the
     * statusDynamics / successRateDistribution preview panels have data. Each of the
     * {@code caseCount} cases flips status on a per-case cadence, giving a spread of
     * per-case success rates and a varied status mix across runs.
     */
    private static void writeHistoryFixture(Path file) throws Exception {
        int runCount = 12;
        int caseCount = 16;
        String[] statuses = {"passed", "failed", "broken", "skipped", "unknown"};
        StringBuilder sb = new StringBuilder();
        for (int run = 0; run < runCount; run++) {
            long timestamp = 1_782_900_000_000L + run * 3_600_000L;
            // One JSON object per line (JSONL): no embedded newlines inside a run.
            StringBuilder results = new StringBuilder();
            for (int c = 0; c < caseCount; c++) {
                String id = UUID.nameUUIDFromBytes(("hist-case-" + c).getBytes(StandardCharsets.UTF_8))
                        .toString().replace("-", "");
                // Cases with a low index pass more often; higher index flip to non-passed more.
                boolean passes = (run % (2 + c % 5)) != 0 && c % 7 != 6;
                String status = passes ? "passed" : statuses[1 + ((run + c) % 4)];
                if (c > 0) {
                    results.append(", ");
                }
                results.append("\"").append(id).append("\": {")
                        .append("\"id\": \"").append(id).append("\", ")
                        .append("\"name\": \"Case ").append(c).append("\", ")
                        .append("\"status\": \"").append(status).append("\"}");
            }
            sb.append("{\"uuid\": \"run-").append(run).append("\", ")
                    .append("\"name\": \"preview run ").append(run).append("\", ")
                    .append("\"timestamp\": ").append(timestamp).append(", ")
                    .append("\"testResults\": {").append(results).append("}}")
                    .append("\n");
        }
        Files.write(file, sb.toString().getBytes(StandardCharsets.UTF_8));
        System.out.println("History fixture runs=" + runCount + " -> " + file.getFileName());
    }
}
