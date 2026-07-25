package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.exceptions.InvalidArgumentException;
import lombok.extern.slf4j.Slf4j;

import java.awt.Image;
import java.awt.image.BufferedImage;

@Slf4j
public class LogoScaler {

    /**
    * Downscaling logo image on a base of free space of chart
    *
    * <p>This utility method is used to downscale logo image to be inserted into the chart.
    * Downscale logic is based on chart size, view and logo position, and available logo free area sizes.</p>
    *
    * @param logo the logo which should be downscaled
    * @param chartWidth the width of the chart based on which logo should be downscaled
    * @param chartHeight the width of the chart based on which logo should be downscaled
    * @return downscaled image with available width and height of logo
    * @throws InvalidArgumentException if logo or chart is null
    */
    public static Image scaleLogo(BufferedImage logo, int chartWidth, int chartHeight) {
        if (logo == null) {
            throw new InvalidArgumentException("Logo can't be null!");
        }
        // 23% is a max width of logo: between left edge of image and the top left edge of chart including 5px padding
        double maxLogoWidth = chartWidth * 0.23;
        // 14% is a max height of logo: between top left edge of chart and a top of image including 5px padding
        double maxLogoHeight = chartHeight * 0.14;
        if (logo.getWidth() > maxLogoWidth || logo.getHeight() > maxLogoHeight) {
            log.debug("Calculating scale: width {}, height {}", logo.getWidth(), logo.getHeight());
            double scale = Math.min(maxLogoWidth / logo.getWidth(), maxLogoHeight / logo.getHeight());
            log.debug("Calculating new logo size on the base of scale: {}", scale);
            int newWidth = (int) (logo.getWidth() * scale);
            int newHeight = (int) (logo.getHeight() * scale);
            log.debug("New logo params: width {}, height {}", newWidth, newHeight);
            return logo.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH);
        } else {
            return logo;
        }
    }
}
