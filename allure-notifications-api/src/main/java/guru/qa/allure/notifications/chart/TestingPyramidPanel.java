package guru.qa.allure.notifications.chart;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.report.ReportAnalytics;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TestingPyramidPanel implements ChartPanel {
    public static final String ID = "testingPyramid";
    private static final int MARGIN = 16;
    private static final int TITLE_HEIGHT = 24;
    private static final int MIN_BAND_HEIGHT = 10;

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        ReportAnalytics analytics = context.getAnalytics();
        LayerBreakdown breakdown = LayerBreakdown.from(analytics.getLayers());
        if (!breakdown.hasKnownLayers() && "suites".equalsIgnoreCase(resolveFallback(context.getBase()))) {
            return new SuitesPanel().render(context);
        }
        return renderPyramid(context, breakdown);
    }

    private static String resolveFallback(Base base) {
        if (base != null && base.getChart() != null && base.getChart().getPyramidFallback() != null) {
            return base.getChart().getPyramidFallback();
        }
        return "suites";
    }

    private static BufferedImage renderPyramid(PanelContext context, LayerBreakdown breakdown) {
        int width = context.getWidth();
        int height = context.getHeight();
        ChartTheme theme = context.getTheme();
        boolean darkMode = theme.isDark();

        List<LayerBand> bands = new ArrayList<LayerBand>();
        for (String layer : PyramidLayerColors.ORDER_BOTTOM_TO_TOP) {
            int count = breakdown.knownCounts.getOrDefault(layer, 0);
            if (count > 0) {
                bands.add(new LayerBand(layer, count));
            }
        }
        if (breakdown.unknownCount > 0) {
            bands.add(new LayerBand(PyramidLayerColors.OTHER_LAYER, breakdown.unknownCount));
        }

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(theme.getBackground());
            graphics.fillRect(0, 0, width, height);

            graphics.setColor(theme.getText());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
            graphics.drawString("Testing pyramid", MARGIN, MARGIN + 12);

            if (bands.isEmpty()) {
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No layer data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            int chartTop = MARGIN + TITLE_HEIGHT;
            int chartHeight = height - chartTop - MARGIN;
            int chartWidth = width - (MARGIN * 2);
            int centerX = MARGIN + chartWidth / 2;
            int totalCount = 0;
            for (LayerBand band : bands) {
                totalCount += band.count;
            }

            int[] bandHeights = allocateBandHeights(bands, chartHeight, totalCount);
            int yBottom = chartTop + chartHeight;
            int layerCount = bands.size();

            for (int index = 0; index < layerCount; index++) {
                LayerBand band = bands.get(index);
                int bandHeight = bandHeights[index];
                int yTop = yBottom - bandHeight;

                double bottomFraction = (layerCount - index) / (double) layerCount;
                double topFraction = (layerCount - index - 1) / (double) layerCount;
                int bottomHalfWidth = (int) (chartWidth * bottomFraction / 2.0d);
                int topHalfWidth = (int) (chartWidth * topFraction / 2.0d);

                int[] xPoints = {
                    centerX - bottomHalfWidth, centerX + bottomHalfWidth,
                    centerX + topHalfWidth, centerX - topHalfWidth};
                int[] yPoints = {yBottom, yBottom, yTop, yTop};

                Color color = PyramidLayerColors.OTHER_LAYER.equals(band.layer)
                        ? PyramidLayerColors.colorForOther(darkMode)
                        : PyramidLayerColors.colorFor(band.layer, darkMode);
                if (color == null) {
                    color = theme.getAccent();
                }
                graphics.setColor(color);
                graphics.fillPolygon(xPoints, yPoints, 4);
                graphics.setColor(color.darker());
                graphics.drawPolygon(xPoints, yPoints, 4);

                graphics.setColor(contrastText(color, theme.getText()));
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 10));
                String label = band.layer + " (" + band.count + ")";
                FontMetrics metrics = graphics.getFontMetrics();
                int labelWidth = metrics.stringWidth(label);
                graphics.drawString(label, centerX - labelWidth / 2,
                        (yTop + yBottom) / 2 + metrics.getAscent() / 2 - 2);

                yBottom = yTop;
            }
        } finally {
            graphics.dispose();
        }

        log.info("Testing pyramid panel is created with {} layer(s).", bands.size());
        return image;
    }

    private static int[] allocateBandHeights(List<LayerBand> bands, int chartHeight, int totalCount) {
        int[] heights = new int[bands.size()];
        int allocated = 0;
        for (int index = 0; index < bands.size(); index++) {
            int proportional = (int) Math.round(bands.get(index).count / (double) totalCount * chartHeight);
            heights[index] = Math.max(MIN_BAND_HEIGHT, proportional);
            allocated += heights[index];
        }
        if (allocated > chartHeight) {
            double scale = chartHeight / (double) allocated;
            allocated = 0;
            for (int index = 0; index < heights.length; index++) {
                heights[index] = Math.max(1, (int) Math.round(heights[index] * scale));
                allocated += heights[index];
            }
            while (allocated > chartHeight) {
                for (int index = 0; index < heights.length && allocated > chartHeight; index++) {
                    if (heights[index] > 1) {
                        heights[index]--;
                        allocated--;
                    }
                }
            }
        }
        return heights;
    }

    private static Color contrastText(Color fill, Color fallback) {
        double luminance = (0.299d * fill.getRed() + 0.587d * fill.getGreen() + 0.114d * fill.getBlue()) / 255.0d;
        return luminance > 0.6d ? Color.BLACK : fallback;
    }

    private static final class LayerBand {
        private final String layer;
        private final int count;

        private LayerBand(String layer, int count) {
            this.layer = layer;
            this.count = count;
        }
    }

    static final class LayerBreakdown {
        private final Map<String, Integer> knownCounts;
        private final int unknownCount;

        private LayerBreakdown(Map<String, Integer> knownCounts, int unknownCount) {
            this.knownCounts = knownCounts;
            this.unknownCount = unknownCount;
        }

        static LayerBreakdown from(Map<String, Integer> layers) {
            java.util.LinkedHashMap<String, Integer> known = new java.util.LinkedHashMap<String, Integer>();
            int unknown = 0;
            if (layers != null) {
                for (Map.Entry<String, Integer> entry : layers.entrySet()) {
                    Integer count = entry.getValue();
                    if (count == null || count <= 0) {
                        continue;
                    }
                    if (PyramidLayerColors.isKnownLayer(entry.getKey())) {
                        known.merge(entry.getKey().trim().toLowerCase(java.util.Locale.ROOT), count, Integer::sum);
                    } else {
                        unknown += count;
                    }
                }
            }
            return new LayerBreakdown(known, unknown);
        }

        boolean hasKnownLayers() {
            return !knownCounts.isEmpty();
        }
    }
}
