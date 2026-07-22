package guru.qa.allure.notifications.chart;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import lombok.extern.slf4j.Slf4j;

/**
 * Horizontal bars of Allure {@code severity} label counts from {@code *-result.json}
 * (awesome-charts {@code testResultSeverities}).
 *
 * <p>Canonical order: blocker → critical → normal → minor → trivial; any other keys
 * follow alphabetically. Empty when no severity labels are present.
 */
@Slf4j
public class TestResultSeveritiesPanel implements ChartPanel {
    public static final String ID = "testresultseverities";
    private static final int MARGIN = 16;
    private static final int TITLE_HEIGHT = 24;
    private static final int ROW_HEIGHT = 22;
    private static final List<String> CANON_ORDER =
            Arrays.asList("blocker", "critical", "normal", "minor", "trivial");
    private static final Color BLOCKER = new Color(0xc0392b);
    private static final Color CRITICAL = ChartTheme.STATUS_FAILED;
    private static final Color NORMAL = new Color(0xff8c42);
    private static final Color MINOR = ChartTheme.STATUS_BROKEN;
    private static final Color TRIVIAL = ChartTheme.STATUS_SKIPPED;

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        int width = context.getWidth();
        int height = context.getHeight();
        ChartTheme theme = context.getTheme();
        Map<String, Integer> ordered = orderedSeverities(context.getAnalytics().getSeverities());

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
                graphics.drawString("Results by severity", MARGIN, MARGIN + 12);
            }

            if (ordered.isEmpty()) {
                graphics.setColor(theme.getText());
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No severity data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            int maxCount = 1;
            for (Integer count : ordered.values()) {
                maxCount = Math.max(maxCount, count);
            }

            int chartTop = showTitle ? MARGIN + TITLE_HEIGHT : MARGIN;
            int chartWidth = width - (MARGIN * 2);
            int labelWidth = Math.min(100, chartWidth / 3);
            int barAreaWidth = chartWidth - labelWidth - 40;
            graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 11));

            int index = 0;
            for (Map.Entry<String, Integer> entry : ordered.entrySet()) {
                int y = chartTop + index * ROW_HEIGHT;
                if (y + ROW_HEIGHT > height - MARGIN) {
                    break;
                }
                String key = entry.getKey();
                int count = entry.getValue();

                graphics.setColor(theme.getText());
                graphics.drawString(key, MARGIN, y + 14);

                int barWidth = (int) ((count / (double) maxCount) * barAreaWidth);
                int barX = MARGIN + labelWidth;
                int barY = y + 4;
                graphics.setColor(severityColor(key, theme));
                Bars.fillPill(graphics, barX, barY, Math.max(barWidth, 2), 12);

                graphics.setColor(theme.getText());
                graphics.drawString(String.valueOf(count), barX + barWidth + 6, y + 14);
                index++;
            }
        } finally {
            graphics.dispose();
        }

        log.info("Severity panel is created with {} bucket(s).", ordered.size());
        return image;
    }

    static Map<String, Integer> orderedSeverities(Map<String, Integer> raw) {
        Map<String, Integer> ordered = new LinkedHashMap<String, Integer>();
        if (raw == null || raw.isEmpty()) {
            return ordered;
        }
        for (String key : CANON_ORDER) {
            Integer count = raw.get(key);
            if (count != null && count > 0) {
                ordered.put(key, count);
            }
        }
        raw.keySet().stream()
                .filter(key -> !CANON_ORDER.contains(key))
                .sorted()
                .forEach(key -> {
                    Integer count = raw.get(key);
                    if (count != null && count > 0) {
                        ordered.put(key, count);
                    }
                });
        return ordered;
    }

    private static Color severityColor(String key, ChartTheme theme) {
        String normalized = key == null ? "" : key.toLowerCase(Locale.ROOT);
        if ("blocker".equals(normalized)) {
            return BLOCKER;
        }
        if ("critical".equals(normalized)) {
            return CRITICAL;
        }
        if ("normal".equals(normalized)) {
            return NORMAL;
        }
        if ("minor".equals(normalized)) {
            return MINOR;
        }
        if ("trivial".equals(normalized)) {
            return TRIVIAL;
        }
        return theme.getAccent();
    }
}
