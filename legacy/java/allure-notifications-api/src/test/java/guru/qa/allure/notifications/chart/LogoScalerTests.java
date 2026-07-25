package guru.qa.allure.notifications.chart;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.util.stream.Stream;

import static java.awt.image.BufferedImage.TYPE_INT_RGB;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.params.provider.Arguments.arguments;

class LogoScalerTests {

    private static final int CHART_WIDTH = 500;
    private static final int CHART_HEIGHT = 250;

    private static final int MAX_LOGO_WIDTH = 115;
    private static final int MAX_LOGO_HEIGHT = 35;

    @ParameterizedTest(name = "{4}")
    @MethodSource("logoScalingTestCases")
    void shouldScaleLogo(int inputWidth, int inputHeight, int expectedWidth, int expectedHeight,
            String description) {
        BufferedImage logo = new BufferedImage(inputWidth, inputHeight, TYPE_INT_RGB);
        Image scaledLogo = LogoScaler.scaleLogo(logo, CHART_WIDTH, CHART_HEIGHT);
        assertEquals(expectedWidth, scaledLogo.getWidth(null), "Width should match expected value");
        assertEquals(expectedHeight, scaledLogo.getHeight(null), "Height should match expected value");
    }

    private static Stream<Arguments> logoScalingTestCases() {
        return Stream.of(
                arguments(MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT, MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT,
                        "logo should not be downscaled when sides length is available"),
                arguments(MAX_LOGO_WIDTH + 5, MAX_LOGO_HEIGHT, 115, 33,
                        "logo should be downscaled if width more than available"),
                arguments(MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT + 5, 100, 35,
                        "logo should be downscaled if height more than available"),
                arguments(MAX_LOGO_WIDTH + 5, MAX_LOGO_HEIGHT + 5, 105, 35,
                        "logo should be downscaled if both sides more than available")
        );
    }
}
