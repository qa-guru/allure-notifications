package guru.qa.allure.notifications.json;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import guru.qa.allure.notifications.util.ResourcesUtil;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for json parsing and pretty printing.
 */
@Slf4j
public class JSON {
    private static final ResourcesUtil RESOURCES_UTIL = new ResourcesUtil();
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    public <T> T parseFile(String file, Class<T> clazz) throws FileNotFoundException {
        log.info("Mapping file at path {} to {} object", file, clazz.getSimpleName());
        return GSON.fromJson(new FileReader(file), clazz);
    }

    public <T> T parseFile(File file, Class<T> clazz) throws FileNotFoundException {
        log.info("Mapping file at path {} to {} object", file.getAbsolutePath(), clazz.getSimpleName());
        return GSON.fromJson(new FileReader(file), clazz);
    }

    public <T> T parseResource(String resourcePath, Class<T> clazz) throws IOException {
        log.info("Mapping resource at path {} to {} object", resourcePath, clazz.getSimpleName());
        try (InputStream inputStream = RESOURCES_UTIL.getResourceAsStream(resourcePath);
             InputStreamReader inputStreamReader = new InputStreamReader(inputStream)) {
            return GSON.fromJson(inputStreamReader, clazz);
        }
    }

    public String prettyPrint(String json) {
        return GSON.toJson(JsonParser.parseString(json));
    }
}
