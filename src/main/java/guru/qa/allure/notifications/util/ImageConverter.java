package guru.qa.allure.notifications.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.io.IOUtils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
@Slf4j
public class ImageConverter {

    public static String convertToBase64() {
        final String fileName = "chart.png";
        log.info("Converting {} to base64 String", fileName);
        byte[] content = new byte[0];
        try (InputStream in = new FileInputStream(fileName)) {
            content = IOUtils.toByteArray(in);
        } catch (IOException e) {
            log.error(e.getLocalizedMessage());
            System.exit(1);
        }
        String base64 = Base64.getEncoder().encodeToString(content);
        log.info("Base64 content: {}", base64);
        log.info("Done.");
        return base64;
    }
}
