package guru.qa.allure.notifications.json;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import lombok.extern.slf4j.Slf4j;

import java.io.FileNotFoundException;
import java.io.FileReader;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for json parsing and pretty printing.
 */
@Slf4j
public class JSON {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    public <T> T parse(String file, Class<T> clazz) {
        log.info("Parsing *.json file by path {}", file);
        try {
            return GSON.fromJson(new FileReader(file), clazz);
        } catch (FileNotFoundException ex) {
            throw new ConfigNotFoundException("Unable to find config file by path " + file);
        }
    }

    public String prettyPrint(String json) {
        return GSON.toJson(JsonParser.parseString(json));
    }
}
