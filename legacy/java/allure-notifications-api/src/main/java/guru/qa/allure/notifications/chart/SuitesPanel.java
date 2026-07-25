package guru.qa.allure.notifications.chart;

import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.List;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.report.SuiteStat;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SuitesPanel implements ChartPanel {
    public static final String ID = "suites";
    private static final int MARGIN = 16;
    private static final int TITLE_HEIGHT = 24;

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        int width = context.getWidth();
        int height = context.getHeight();
        ChartTheme theme = context.getTheme();
        List<SuiteStat> suites = context.getAnalytics().getSuites();

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
                graphics.drawString("Suites", MARGIN, MARGIN + 12);
            }

            if (suites.isEmpty()) {
                graphics.setColor(theme.getText());
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No suite data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            int maxCount = 1;
            for (SuiteStat suite : suites) {
                maxCount = Math.max(maxCount, suite.getCount());
            }

            int chartWidth = width - (MARGIN * 2);
            int labelWidth = Math.min(180, chartWidth / 3);
            int barAreaWidth = chartWidth - labelWidth - 40;
            HorizontalBarRows.Layout layout =
                    HorizontalBarRows.layout(height, showTitle, suites.size());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, layout.fontSize));
            java.awt.FontMetrics metrics = graphics.getFontMetrics();

            for (int index = 0; index < suites.size(); index++) {
                SuiteStat suite = suites.get(index);
                String label = truncate(suite.getName(), 24);
                int baseline = layout.textBaseline(metrics, index);

                graphics.setColor(theme.getText());
                graphics.drawString(label, MARGIN, baseline);

                int barWidth = (int) ((suite.getCount() / (double) maxCount) * barAreaWidth);
                int barX = MARGIN + labelWidth;
                graphics.setColor(theme.getAccent());
                Bars.fillPill(graphics, barX, layout.barTop(index), Math.max(barWidth, 2), layout.barHeight);

                graphics.setColor(theme.getText());
                graphics.drawString(String.valueOf(suite.getCount()), barX + barWidth + 6, baseline);
            }
        } finally {
            graphics.dispose();
        }

        log.info("Suites panel is created with {} suite(s).", suites.size());
        return image;
    }

    private static String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + "...";
    }
}
