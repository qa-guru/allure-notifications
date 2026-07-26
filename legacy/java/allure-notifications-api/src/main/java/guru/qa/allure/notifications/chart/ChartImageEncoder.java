package guru.qa.allure.notifications.chart;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.imageio.ImageIO;

import guru.qa.allure.notifications.exceptions.MessageBuildException;

/**
 * PNG encoding helpers for chart panels.
 */
public final class ChartImageEncoder {
    private ChartImageEncoder() {
    }

    public static byte[] toPngBytes(BufferedImage image) throws MessageBuildException {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            ImageIO.write(image, "png", output);
            return output.toByteArray();
        } catch (IOException e) {
            throw new MessageBuildException("Unable to create image with chart", e);
        }
    }
}
