package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.helpers.Base;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Base64;

public class ImageConverter {
    private static final Logger LOG = LoggerFactory.getLogger("Img Converter");

    public static String convertToBase64() {
        final String fileName = Base.chartName() + ".png";
        LOG.info("Converting... {} to base64 String", fileName);
        byte[] content = new byte[0];
        try {
            content = FileUtils.readFileToByteArray(new File(fileName));
        } catch (IOException e) {
            LOG.error("Unable to convert file {}!", fileName);
            LOG.error(e.getLocalizedMessage());
            System.exit(1);
        }
        String base64 = Base64.getEncoder().encodeToString(content);
        LOG.info("Base64 content: {}", base64);
        LOG.info("Done.");
        return base64;
    }
}
