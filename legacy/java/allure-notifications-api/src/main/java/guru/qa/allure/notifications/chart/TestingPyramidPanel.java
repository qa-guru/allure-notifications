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
    private static final int MIN_BAND_WIDTH = 24;
    // Few populated layers must still read as a small centred pyramid, not one
    // full-bleed block: reserve a floor of vertical slots so tiers keep a sane
    // height, and cap a single tier so tall panels don't stretch it edge to edge.
    private static final int MIN_TIERS_FOR_HEIGHT = 4;
    private static final int MAX_TIER_HEIGHT = 160;
    // Tier width follows the layer's rank in the FULL canonical pyramid (unit
    // widest ... manual/other narrowest), independent of how many layers are
    // populated — so a lone e2e stays narrow instead of spanning the whole card,
    // and gaps between present layers don't inflate widths. Base tier keeps a
    // margin inside the card (MAX < 1.0).
    private static final double MAX_WIDTH_FRACTION = 0.92d;
    private static final double MIN_WIDTH_FRACTION = 0.30d;
    // Canon "rounded tiers" (#071): gap between tiers + corner radius, both as a
    // fraction of the band height. Keep in sync with dashboard-overrides.js.
    private static final double TIER_GAP_RATIO = 0.11d;
    private static final double CORNER_RATIO = 0.18d;

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

            boolean showTitle = context.isShowTitle();
            if (showTitle) {
                graphics.setColor(theme.getText());
                graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
                graphics.drawString("Testing pyramid", MARGIN, MARGIN + 12);
            }

            if (bands.isEmpty()) {
                graphics.setColor(theme.getText());
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No layer data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            int chartTop = showTitle ? MARGIN + TITLE_HEIGHT : MARGIN;
            int chartHeight = height - chartTop - MARGIN;
            int chartWidth = width - (MARGIN * 2);
            int centerX = MARGIN + chartWidth / 2;
            int layerCount = bands.size();

            // Canon "rounded tiers" (#071): every tier has the SAME height; only
            // the width steps per layer. Count is shown in the label, not the
            // thickness — so keep bands equal-height regardless of test counts.
            // Reserve a floor of vertical slots (and cap a single tier) so one or
            // two populated layers render as a small centred pyramid instead of a
            // full-bleed block, then centre the stack in the chart area.
            int heightSlots = Math.max(layerCount, MIN_TIERS_FOR_HEIGHT);
            int bandHeight = Math.min(chartHeight / heightSlots, MAX_TIER_HEIGHT);
            int stackHeight = bandHeight * layerCount;
            int yBottom = chartTop + (chartHeight + stackHeight) / 2;

            for (int index = 0; index < layerCount; index++) {
                LayerBand band = bands.get(index);
                int yTop = yBottom - bandHeight;

                // Width follows the layer's rank in the FULL canonical pyramid, not
                // its position among the present layers — so a lone e2e stays narrow.
                double widthFraction = widthFractionFor(band.layer);
                int bandWidth = Math.max(MIN_BAND_WIDTH, (int) (chartWidth * widthFraction));
                int gap = Math.max(2, (int) Math.round(bandHeight * TIER_GAP_RATIO));
                int tierTop = yTop + gap / 2;
                int tierHeight = Math.max(1, bandHeight - gap);
                int tierX = centerX - bandWidth / 2;
                double radius = Math.min(
                        Math.min(bandWidth / 2.0d, tierHeight / 2.0d),
                        tierHeight * CORNER_RATIO);
                int arc = (int) Math.round(radius * 2.0d);

                Color color = PyramidLayerColors.OTHER_LAYER.equals(band.layer)
                        ? PyramidLayerColors.colorForOther(darkMode)
                        : PyramidLayerColors.colorFor(band.layer, darkMode);
                if (color == null) {
                    color = theme.getAccent();
                }
                graphics.setColor(color);
                graphics.fillRoundRect(tierX, tierTop, bandWidth, tierHeight, arc, arc);
                graphics.setColor(color.darker());
                graphics.drawRoundRect(tierX, tierTop, bandWidth, tierHeight, arc, arc);

                graphics.setColor(contrastText(color, theme.getText()));
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 10));
                String label = band.layer + " (" + band.count + ")";
                FontMetrics metrics = graphics.getFontMetrics();
                int labelWidth = metrics.stringWidth(label);
                graphics.drawString(label, centerX - labelWidth / 2,
                        tierTop + tierHeight / 2 + metrics.getAscent() / 2 - 2);

                yBottom = yTop;
            }
        } finally {
            graphics.dispose();
        }

        log.info("Testing pyramid panel is created with {} layer(s).", bands.size());
        return image;
    }

    /**
     * Tier width as a fraction of the chart width, by the layer's rank in the full
     * canonical pyramid (unit widest ... manual/other narrowest). Independent of how
     * many layers are actually populated, so gaps between present layers don't distort
     * the shape and a single layer keeps its natural (narrow) width.
     */
    private static double widthFractionFor(String layer) {
        int fullTiers = PyramidLayerColors.ORDER_BOTTOM_TO_TOP.size();
        int rankFromBottom = PyramidLayerColors.ORDER_BOTTOM_TO_TOP.indexOf(layer);
        if (rankFromBottom < 0) {
            // OTHER / unknown aggregate sits above the top known layer → narrowest.
            rankFromBottom = fullTiers;
        }
        double span = MAX_WIDTH_FRACTION - MIN_WIDTH_FRACTION;
        double fraction = MAX_WIDTH_FRACTION - span * (rankFromBottom / (double) (fullTiers - 1));
        return Math.max(MIN_WIDTH_FRACTION, Math.min(MAX_WIDTH_FRACTION, fraction));
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
