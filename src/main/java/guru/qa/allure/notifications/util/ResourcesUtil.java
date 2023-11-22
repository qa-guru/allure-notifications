package guru.qa.allure.notifications.util;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;

public class ResourcesUtil {
    public InputStream getResourceAsStream(String path) throws IOException {
        InputStream resourceStream = getClass().getResourceAsStream(path);
        if (resourceStream != null) {
            return resourceStream;
        }
        //this will probably work in your IDE, but not from a JAR
        File file = new File(path);
        return Files.newInputStream(file.toPath());
    }
}
