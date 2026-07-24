package guru.qa.allure.notifications.chart;

import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DurationsPanel implements ChartPanel {
    public static final String ID = "durations";
    private static final int MARGIN = 16;
    private static final int TITLE_HEIGHT = 24;
    private static final int DEFAULT_BINS = 10;

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        ChartTheme theme = context.getTheme();
        int width = context.getWidth();
        int height = context.getHeight();
        List<Long> durationsMs = context.getAnalytics().getDurationsMs();

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
                graphics.drawString(titleFor(context), MARGIN, MARGIN + 12);
            }

            if (isLayerGroupBy(context.getGroupBy())) {
                Map<String, Double> avgSeconds = averageSecondsByLayer(
                        context.getAnalytics().getDurationsMsByLayer());
                if (!avgSeconds.isEmpty()) {
                    drawLayerAverages(graphics, theme, width, height, showTitle, avgSeconds);
                    log.info("Durations panel (groupBy=layer) with {} layer(s).", avgSeconds.size());
                    return image;
                }
                // Fallback: no per-layer samples → ungrouped histogram (tile stays filled).
                log.info("Durations groupBy=layer has no layer samples; falling back to histogram.");
            }

            if (durationsMs.isEmpty()) {
                graphics.setColor(theme.getText());
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No duration data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            drawHistogram(graphics, theme, width, height, showTitle, durationsMs);
        } finally {
            graphics.dispose();
        }

        log.info("Durations panel is created with {} sample(s).", durationsMs.size());
        return image;
    }

    private static String titleFor(PanelContext context) {
        if (isLayerGroupBy(context.getGroupBy())) {
            return "Durations by layer (s)";
        }
        return "Durations (s)";
    }

    static boolean isLayerGroupBy(String groupBy) {
        return groupBy != null && "layer".equalsIgnoreCase(groupBy.trim());
    }

    static Map<String, Double> averageSecondsByLayer(Map<String, List<Long>> byLayer) {
        Map<String, Double> averages = new LinkedHashMap<String, Double>();
        if (byLayer == null || byLayer.isEmpty()) {
            return averages;
        }
        // Top → bottom rows match Testing pyramid (manual … unit), not bottom-up storage order.
        List<String> keys = new ArrayList<String>();
        List<String> pyramidOrder = PyramidLayerColors.ORDER_BOTTOM_TO_TOP;
        for (int i = pyramidOrder.size() - 1; i >= 0; i--) {
            String ordered = pyramidOrder.get(i);
            if (byLayer.containsKey(ordered)) {
                keys.add(ordered);
            }
        }
        for (String key : byLayer.keySet()) {
            if (!keys.contains(key)) {
                keys.add(key);
            }
        }
        for (String key : keys) {
            List<Long> samples = byLayer.get(key);
            if (samples == null || samples.isEmpty()) {
                continue;
            }
            double sum = 0;
            for (Long sample : samples) {
                if (sample != null) {
                    sum += sample;
                }
            }
            averages.put(key, (sum / samples.size()) / 1000.0d);
        }
        return averages;
    }

    private static void drawLayerAverages(Graphics2D graphics, ChartTheme theme,
                                          int width, int height, boolean showTitle,
                                          Map<String, Double> avgSeconds) {
        int chartWidth = width - (MARGIN * 2);
        int labelWidth = Math.min(90, chartWidth / 3);
        int barAreaWidth = Math.max(1, chartWidth - labelWidth - 48);
        double maxAvg = 0.001d;
        for (Double value : avgSeconds.values()) {
            maxAvg = Math.max(maxAvg, value);
        }
        HorizontalBarRows.Layout layout =
                HorizontalBarRows.layout(height, showTitle, avgSeconds.size());
        graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, layout.fontSize));
        java.awt.FontMetrics metrics = graphics.getFontMetrics();
        int index = 0;
        for (Map.Entry<String, Double> entry : avgSeconds.entrySet()) {
            String key = entry.getKey();
            double avg = entry.getValue();
            int baseline = layout.textBaseline(metrics, index);
            graphics.setColor(theme.getText());
            graphics.drawString(key, MARGIN, baseline);
            int barWidth = (int) ((avg / maxAvg) * barAreaWidth);
            int barX = MARGIN + labelWidth;
            java.awt.Color layerColor = PyramidLayerColors.colorFor(key, theme.isDark());
            graphics.setColor(layerColor != null ? layerColor : theme.getAccent());
            Bars.fillPill(graphics, barX, layout.barTop(index), Math.max(barWidth, 2), layout.barHeight);
            graphics.setColor(theme.getText());
            graphics.drawString(String.format(Locale.ROOT, "%.1f", avg),
                    barX + barWidth + 6, baseline);
            index++;
        }
    }

    private static void drawHistogram(Graphics2D graphics, ChartTheme theme,
                                      int width, int height, boolean showTitle,
                                      List<Long> durationsMs) {
        double[] values = durationsMs.stream()
                .mapToDouble(duration -> duration / 1000.0d)
                .toArray();
        int bins = Math.min(DEFAULT_BINS, Math.max(3, values.length / 2));
        int[] histogram = histogram(values, bins);

        int chartTop = PanelPlotArea.chartTop(showTitle);
        int chartHeight = PanelPlotArea.chartHeight(height, showTitle);
        int chartWidth = width - (MARGIN * 2);
        int barWidth = Math.max(1, chartWidth / bins);
        int maxCount = Arrays.stream(histogram).max().orElse(1);
        int arc = Math.min(Bars.DEFAULT_ARC, Math.max(2, barWidth / 2));

        for (int index = 0; index < bins; index++) {
            int count = histogram[index];
            int barHeight = count <= 0 ? 0
                    : Math.max(1, (int) Math.round((count / (double) maxCount) * chartHeight));
            int x = MARGIN + index * barWidth;
            int y = chartTop + chartHeight - barHeight;
            int bw = Math.max(barWidth - 2, 1);
            graphics.setColor(theme.getAccent());
            Bars.fillTopRounded(graphics, x + 1, y, bw, barHeight, arc);
        }
    }

    private static int[] histogram(double[] values, int bins) {
        double min = Arrays.stream(values).min().orElse(0);
        double max = Arrays.stream(values).max().orElse(1);
        if (max <= min) {
            max = min + 1;
        }
        int[] counts = new int[bins];
        double binWidth = (max - min) / bins;
        for (double value : values) {
            int index = (int) ((value - min) / binWidth);
            if (index >= bins) {
                index = bins - 1;
            }
            if (index < 0) {
                index = 0;
            }
            counts[index]++;
        }
        return counts;
    }
}
