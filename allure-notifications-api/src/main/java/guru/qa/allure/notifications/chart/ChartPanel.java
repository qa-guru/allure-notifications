package guru.qa.allure.notifications.chart;

import java.awt.image.BufferedImage;

import guru.qa.allure.notifications.exceptions.MessageBuildException;

/**
 * Single chart panel for collage or legacy pie rendering.
 */
public interface ChartPanel {
    String getId();

    BufferedImage render(PanelContext context) throws MessageBuildException;
}
