package guru.qa.allure.notifications.util;

import java.io.*;
import java.net.URL;

public class ResourcesUtil {
    public String resourcesPath(String path) {
        File file = null;
        URL res = getClass().getResource(path);
        if ("jar".equals(res.getProtocol())) {
            try (InputStream input = getClass().getResourceAsStream(path)) {
                file = File.createTempFile("tempfile", ".tmp");
                try (OutputStream out = new FileOutputStream(file)) {
                    int read;
                    byte[] bytes = new byte[1024];

                    while ((read = input.read(bytes)) != -1) {
                        out.write(bytes, 0, read);
                    }
                }
                file.deleteOnExit();
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        } else {
            //this will probably work in your IDE, but not from a JAR
            file = new File(res.getFile());
        }

        if (file != null && !file.exists()) {
            throw new RuntimeException("Error: File " + file + " not found!");
        }

        return file.getPath();
    }
}
