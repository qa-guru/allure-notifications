package guru.qa.allure.notifications.chart;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.List;
import java.util.Map;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.report.HistoryAnalytics;
import lombok.extern.slf4j.Slf4j;

/**
 * Status dynamics over the last N runs: one stacked bar per run
 * (passed/failed/broken/skipped/unknown), drawn with Java2D.
 *
 * <p>Reads the history-derived series from {@link HistoryAnalytics}; when no history
 * is available a "No history data" placeholder is shown.
 */
@Slf4j
public class StatusDynamicsPanel implements ChartPanel {
    public static final String ID = "statusdynamics";
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
                graphics.drawString("Status dynamics", MARGIN, MARGIN + 12);
            }

            if (history == null || history.isEmpty()) {
                graphics.setColor(theme.getText());
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            List<Map<String, Integer>> dynamics = history.getStatusDynamics();
            int runs = dynamics.size();
            int chartTop = PanelPlotArea.chartTop(showTitle);
            int chartHeight = PanelPlotArea.chartHeight(height, showTitle);
            int chartWidth = width - MARGIN * 2;
            int slot = Math.max(1, chartWidth / runs);
            int barWidth = Math.max(1, Math.min(slot - 4, slot));

            for (int i = 0; i < runs; i++) {
                Map<String, Integer> counts = dynamics.get(i);
                int runTotal = 0;
                for (String status : HistoryAnalytics.STATUS_KEYS) {
                    runTotal += counts.getOrDefault(status, 0);
                }
                if (runTotal <= 0) {
                    continue;
                }
                int x = MARGIN + i * slot + (slot - barWidth) / 2;
                int yCursor = chartTop + chartHeight;
                for (String status : HistoryAnalytics.STATUS_KEYS) {
                    int value = counts.getOrDefault(status, 0);
                    if (value <= 0) {
                        continue;
                    }
                    int segmentHeight = Math.max(1, (int) Math.round((value / (double) runTotal) * chartHeight));
                    yCursor -= segmentHeight;
                    graphics.setColor(statusColor(status));
                    Bars.fillTopRounded(graphics, x, yCursor, barWidth, segmentHeight, Bars.DEFAULT_ARC);
                }
            }
        } finally {
            graphics.dispose();
        }

        log.info("Status dynamics panel is created ({} run(s)).",
                history == null ? 0 : history.getRunCount());
        return image;
    }

    private static Color statusColor(String status) {
        switch (status) {
            case "passed":
                return ChartTheme.STATUS_PASSED;
            case "failed":
                return ChartTheme.STATUS_FAILED;
            case "broken":
                return ChartTheme.STATUS_BROKEN;
            case "skipped":
                return ChartTheme.STATUS_SKIPPED;
            default:
                return ChartTheme.STATUS_UNKNOWN;
        }
    }
}
