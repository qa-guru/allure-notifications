package guru.qa.allure.notifications.json;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;

import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for json parsing and pretty printing.
 */
@Slf4j
public class JSON {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    public <T> T parseFile(File file, Class<T> clazz) throws FileNotFoundException {
        log.info("Mapping file at path {} to {} object", file.getAbsolutePath(), clazz.getSimpleName());
        return GSON.fromJson(new FileReader(file), clazz);
    }

    public <T> T parseResource(String resourcePath, Class<T> clazz) throws IOException {
        log.info("Mapping resource at path {} to {} object", resourcePath, clazz.getSimpleName());
        try (InputStream stream = getClass().getResourceAsStream(resourcePath);
             InputStreamReader reader = new InputStreamReader(Objects.requireNonNull(stream), StandardCharsets.UTF_8)) {
            return GSON.fromJson(reader, clazz);
        }
    }

    public String prettyPrint(String json) {
        return GSON.toJson(JsonParser.parseString(json));
    }
}
