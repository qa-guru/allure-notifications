package guru.qa.allure.notifications.scalers;

import guru.qa.allure.notifications.exceptions.InvalidArgumentException;
import lombok.extern.slf4j.Slf4j;
import org.knowm.xchart.PieChart;

import java.awt.*;
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
   * @param chart the chart based on which logo should be downscaled
   * @return downscaled image with available width and height of logo
   * @throws InvalidArgumentException if logo or chart is null
   */
  public static Image scaleLogo(BufferedImage logo, PieChart chart) {
    if (logo == null || chart == null) {
      throw new InvalidArgumentException("Logo or chart can't be null!");
    }
    double maxLogoWidth = chart.getWidth() * 0.23;
    double maxLogoHeight = chart.getHeight() * 0.14;
    if (logo.getWidth() > maxLogoWidth || logo.getHeight() > maxLogoHeight) {
      log.debug("Calculating scale: width {}, height {}", logo.getWidth(), logo.getHeight());
      double scale = Math.min(maxLogoWidth / logo.getWidth(),
          maxLogoHeight / logo.getHeight());
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
