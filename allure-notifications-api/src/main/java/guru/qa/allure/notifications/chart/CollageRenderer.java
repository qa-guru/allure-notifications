package guru.qa.allure.notifications.chart;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.report.ReportAnalytics;
import lombok.extern.slf4j.Slf4j;

/**
 * Renders configured collage panels into a single PNG.
 *
 * <p>Layout: pie (top-left), testing pyramid or suites fallback (top-right), durations (bottom).
 */
@Slf4j
public final class CollageRenderer {
    private static final int DEFAULT_WIDTH = 1000;
    private static final int DEFAULT_HEIGHT = 600;

    private CollageRenderer() {
    }

    public static byte[] render(Base base, ReportAnalytics analytics, Legend legend) throws MessageBuildException {
        ChartConfig chartConfig = base != null ? base.getChart() : null;
        int collageWidth = chartConfig != null && chartConfig.getWidth() != null
                ? chartConfig.getWidth()
                : DEFAULT_WIDTH;
        int collageHeight = chartConfig != null && chartConfig.getHeight() != null
                ? chartConfig.getHeight()
                : DEFAULT_HEIGHT;

        int topHeight = collageHeight / 2;
        int bottomHeight = collageHeight - topHeight;
        int leftWidth = collageWidth / 2;
        int rightWidth = collageWidth - leftWidth;

        BufferedImage pie = new PiePanel().render(
                PanelContext.of(base, leftWidth, topHeight, analytics, legend));
        BufferedImage topRight = new TestingPyramidPanel().render(
                PanelContext.of(base, rightWidth, topHeight, analytics, legend));
        BufferedImage durations = new DurationsPanel().render(
                PanelContext.of(base, collageWidth, bottomHeight, analytics, legend));

        BufferedImage collage = new BufferedImage(collageWidth, collageHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = collage.createGraphics();
        try {
            graphics.drawImage(pie, 0, 0, null);
            graphics.drawImage(topRight, leftWidth, 0, null);
            graphics.drawImage(durations, 0, topHeight, null);
        } finally {
            graphics.dispose();
        }

        log.info("Collage chart is created ({}x{}).", collageWidth, collageHeight);
        return ChartImageEncoder.toPngBytes(collage);
    }
}
