package guru.qa.allure.notifications.chart;

import java.awt.Color;
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
    private static final int ROW_HEIGHT = 22;

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

            int chartTop = showTitle ? MARGIN + TITLE_HEIGHT : MARGIN;
            int chartWidth = width - (MARGIN * 2);
            int labelWidth = Math.min(180, chartWidth / 3);
            int barAreaWidth = chartWidth - labelWidth - 40;
            graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 11));

            for (int index = 0; index < suites.size(); index++) {
                SuiteStat suite = suites.get(index);
                int y = chartTop + index * ROW_HEIGHT;
                if (y + ROW_HEIGHT > height - MARGIN) {
                    break;
                }

                String label = truncate(suite.getName(), 24);
                graphics.setColor(theme.getText());
                graphics.drawString(label, MARGIN, y + 14);

                int barWidth = (int) ((suite.getCount() / (double) maxCount) * barAreaWidth);
                int barX = MARGIN + labelWidth;
                int barY = y + 4;
                graphics.setColor(theme.getAccent());
                graphics.fillRect(barX, barY, Math.max(barWidth, 2), 12);
                graphics.setColor(darker(theme.getAccent()));
                graphics.drawRect(barX, barY, Math.max(barWidth, 2), 12);

                graphics.setColor(theme.getText());
                graphics.drawString(String.valueOf(suite.getCount()), barX + barWidth + 6, y + 14);
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

    private static Color darker(Color color) {
        return color.darker();
    }
}
