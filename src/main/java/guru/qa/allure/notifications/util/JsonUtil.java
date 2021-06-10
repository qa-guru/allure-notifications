package guru.qa.allure.notifications.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import guru.qa.allure.notifications.summary.Summary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileNotFoundException;
import java.io.FileReader;

import static com.google.gson.JsonParser.parseString;

public class JsonUtil {
    private static final Logger LOG = LoggerFactory.getLogger("JSON");
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    public static Summary parseFrom(String path) {
        LOG.info("Parsing Summary JSON...");
        final String fullPath = path + "widgets/summary.json";
        LOG.info("File location: {}", fullPath);
        Summary summary = null;
        try {
            LOG.info("Reading JSON...");
            summary = GSON.fromJson(new FileReader(fullPath),
                    Summary.class);
            LOG.info("Done.");
        } catch (FileNotFoundException ex) {
            LOG.error("File by path {} not found!", fullPath);
            System.exit(1);
        }
        LOG.info("Operation is completed.");
        return summary;
    }

    public static String prettyPrint(final String json) {
        return GSON.toJson(parseString(json));
    }
}
