package guru.qa.allure.notifications.report;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.summary.Summary;
import lombok.extern.slf4j.Slf4j;

/**
 * Reads Allure 2 or Allure 3 summary.json into the legacy {@link Summary} model.
 */
@Slf4j
public final class SummaryReader {
    private static final Gson GSON = new GsonBuilder().create();

    private SummaryReader() {
    }

    public static Summary read(JSON json, LocatedReport located) throws IOException {
        Path summaryPath = located.getSummaryPath();
        if (located.getVersion() == AllureReportVersion.ALLURE_2) {
            log.info("Reading Allure 2 summary from {}", summaryPath);
            return json.parseFile(summaryPath.toFile(), Summary.class);
        }
        log.info("Reading Allure 3 summary from {} (adapting to Summary)", summaryPath);
        return adaptAllure3(summaryPath);
    }

    static Summary adaptAllure3(Path summaryPath) throws IOException {
        try (Reader reader = Files.newBufferedReader(summaryPath, StandardCharsets.UTF_8)) {
            JsonObject root = JsonParser.parseReader(reader).getAsJsonObject();
            JsonObject stats = root.has("stats") && root.get("stats").isJsonObject()
                    ? root.getAsJsonObject("stats")
                    : new JsonObject();

            JsonObject statistic = new JsonObject();
            copyInt(stats, statistic, "passed");
            copyInt(stats, statistic, "failed");
            copyInt(stats, statistic, "broken");
            copyInt(stats, statistic, "skipped");
            copyInt(stats, statistic, "total");
            if (stats.has("unknown") && !stats.get("unknown").isJsonNull()) {
                statistic.add("unknown", stats.get("unknown"));
            } else {
                statistic.addProperty("unknown", 0);
            }

            JsonObject time = new JsonObject();
            if (root.has("duration") && !root.get("duration").isJsonNull()) {
                time.add("duration", root.get("duration"));
            } else {
                time.addProperty("duration", 0L);
            }

            JsonObject mapped = new JsonObject();
            mapped.add("statistic", statistic);
            mapped.add("time", time);
            return GSON.fromJson(mapped, Summary.class);
        } catch (FileNotFoundException e) {
            throw e;
        }
    }

    private static void copyInt(JsonObject source, JsonObject target, String field) {
        JsonElement value = source.get(field);
        if (value != null && !value.isJsonNull()) {
            target.add(field, value);
        } else {
            target.addProperty(field, 0);
        }
    }
}
