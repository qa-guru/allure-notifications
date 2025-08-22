package guru.qa.allure.notifications.scalers;

import org.junit.jupiter.api.Test;
import org.knowm.xchart.PieChart;

import java.awt.Image;
import java.awt.image.BufferedImage;

import static java.awt.image.BufferedImage.TYPE_INT_RGB;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class LogoScalerTests {

  private static final PieChart chart = new PieChart(500, 250);

  private static final int maxLogoWidth = 115;
  private static final int maxLogoHeight = 35;

  @Test
  void logoShouldBeNotDownscaledWhenSidesLengthIsAvailable() {
    BufferedImage image = new BufferedImage(maxLogoWidth, maxLogoHeight, TYPE_INT_RGB);
    Image scaledLogo = LogoScaler.scaleLogo(image, chart);
    assertEquals(maxLogoWidth, scaledLogo.getWidth(null));
    assertEquals(maxLogoHeight, scaledLogo.getHeight(null));
  }

  @Test
  void logoShouldBeDownscaledIfWidthMoreThanAvailable() {
    BufferedImage image = new BufferedImage(maxLogoWidth + 5, maxLogoHeight, TYPE_INT_RGB);
    Image scaledLogo = LogoScaler.scaleLogo(image, chart);
    assertEquals(115, scaledLogo.getWidth(null));
    assertEquals(33, scaledLogo.getHeight(null));
  }

  @Test
  void logoShouldBeDownscaledIfHeightMoreThanAvailable() {
    BufferedImage image = new BufferedImage(maxLogoWidth, maxLogoHeight + 5, TYPE_INT_RGB);
    Image scaledLogo = LogoScaler.scaleLogo(image, chart);
    assertEquals(100, scaledLogo.getWidth(null));
    assertEquals(35, scaledLogo.getHeight(null));
  }

  @Test
  void logoShouldBeDownscaledIfBothSidesMoreThanAvailable() {
    BufferedImage image = new BufferedImage(maxLogoWidth + 5, maxLogoHeight + 5, TYPE_INT_RGB);
    Image scaledLogo = LogoScaler.scaleLogo(image, chart);
    assertEquals(105, scaledLogo.getWidth(null));
    assertEquals(35, scaledLogo.getHeight(null));
  }
}
