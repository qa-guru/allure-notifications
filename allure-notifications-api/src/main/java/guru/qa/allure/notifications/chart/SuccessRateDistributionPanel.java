package guru.qa.allure.notifications.chart;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.report.HistoryAnalytics;
import lombok.extern.slf4j.Slf4j;

/**
 * Success-rate distribution: a histogram of per-test-case pass ratios across the
 * history, bucketed 0-10% … 90-100%. Bars are tinted from red (low success) to green
 * (high success). Drawn with Java2D.
 *
 * <p>Reads the history-derived buckets from {@link HistoryAnalytics}; when no history
 * is available a "No history data" placeholder is shown.
 */
@Slf4j
public class SuccessRateDistributionPanel implements ChartPanel {
    public static final String ID = "successratedistribution";
    private static final int MARGIN = 16;
    private static final int TITLE_HEIGHT = 24;

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        ChartTheme theme = context.getTheme();
        int width = context.getWidth();
        int height = context.getHeight();
        HistoryAnalytics history = context.getAnalytics().getHistory();

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
                graphics.drawString("Success rate distribution", MARGIN, MARGIN + 12);
            }

            if (history == null || history.isEmpty()) {
                graphics.setColor(theme.getText());
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            int[] buckets = history.getSuccessRateDistribution();
            int bins = buckets.length;
            List<Integer> active = new ArrayList<Integer>();
            int maxCount = 1;
            for (int i = 0; i < bins; i++) {
                int count = buckets[i];
                if (count > 0) {
                    active.add(i);
                    maxCount = Math.max(maxCount, count);
                }
            }
            if (active.isEmpty()) {
                return image;
            }

            int chartTop = PanelPlotArea.chartTop(showTitle);
            int chartHeight = PanelPlotArea.chartHeight(height, showTitle);
            int chartWidth = width - MARGIN * 2;
            int activeCount = active.size();
            int slot = Math.max(1, chartWidth / activeCount);
            int barWidth = Math.max(1, Math.min(slot - 2, slot));
            int arc = Math.min(Bars.DEFAULT_ARC, Math.max(2, barWidth / 2));

            for (int j = 0; j < activeCount; j++) {
                int bucketIndex = active.get(j);
                int count = buckets[bucketIndex];
                int barHeight = Math.max(1, (int) Math.round((count / (double) maxCount) * chartHeight));
                int x = MARGIN + j * slot + (slot - barWidth) / 2;
                int y = chartTop + chartHeight - barHeight;
                graphics.setColor(bucketColor(bucketIndex, bins));
                Bars.fillTopRounded(graphics, x, y, barWidth, barHeight, arc);
            }
        } finally {
            graphics.dispose();
        }

        log.info("Success rate distribution panel is created.");
        return image;
    }

    /** Linear red-to-green gradient: bucket 0 (low success) red, last bucket green. */
    private static Color bucketColor(int index, int bins) {
        double t = bins <= 1 ? 1.0 : (double) index / (bins - 1);
        Color low = ChartTheme.STATUS_FAILED;
        Color high = ChartTheme.STATUS_PASSED;
        int r = (int) Math.round(low.getRed() + t * (high.getRed() - low.getRed()));
        int g = (int) Math.round(low.getGreen() + t * (high.getGreen() - low.getGreen()));
        int b = (int) Math.round(low.getBlue() + t * (high.getBlue() - low.getBlue()));
        return new Color(r, g, b);
    }
}
