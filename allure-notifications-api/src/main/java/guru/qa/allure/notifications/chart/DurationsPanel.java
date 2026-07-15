package guru.qa.allure.notifications.chart;

import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.Arrays;
import java.util.List;

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
            graphics.setColor(theme.getText());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
            graphics.drawString("Durations (s)", MARGIN, MARGIN + 12);

            if (durationsMs.isEmpty()) {
                graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
                graphics.drawString("No duration data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
                return image;
            }

            double[] values = durationsMs.stream()
                    .mapToDouble(duration -> duration / 1000.0d)
                    .toArray();
            int bins = Math.min(DEFAULT_BINS, Math.max(3, values.length / 2));
            int[] histogram = histogram(values, bins);

            int chartTop = MARGIN + TITLE_HEIGHT;
            int chartHeight = height - chartTop - MARGIN;
            int chartWidth = width - (MARGIN * 2);
            int barWidth = Math.max(1, chartWidth / bins);
            int maxCount = Arrays.stream(histogram).max().orElse(1);

            for (int index = 0; index < bins; index++) {
                int count = histogram[index];
                int barHeight = (int) ((count / (double) maxCount) * (chartHeight - 20));
                int x = MARGIN + index * barWidth;
                int y = chartTop + chartHeight - barHeight;
                graphics.setColor(theme.getAccent());
                graphics.fillRect(x + 1, y, Math.max(barWidth - 2, 1), barHeight);
                graphics.setColor(theme.getAccent().darker());
                graphics.drawRect(x + 1, y, Math.max(barWidth - 2, 1), barHeight);
            }
        } finally {
            graphics.dispose();
        }

        log.info("Durations panel is created with {} sample(s).", durationsMs.size());
        return image;
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
