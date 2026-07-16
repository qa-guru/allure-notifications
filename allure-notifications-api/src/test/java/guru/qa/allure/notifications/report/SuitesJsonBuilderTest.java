package guru.qa.allure.notifications.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;
import java.util.Collections;

import org.junit.jupiter.api.Test;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import guru.qa.allure.notifications.json.JSON;

class SuitesJsonBuilderTest {

    @Test
    void buildsEmptyPayloadForNoResults() {
        String json = SuitesJsonBuilder.fromResults(Collections.<AllureTestResult>emptyList());
        JsonObject root = JsonParser.parseString(json).getAsJsonObject();
        assertEquals(0, root.get("total").getAsInt());
        assertTrue(root.get("items").getAsJsonArray().isEmpty());
    }

    @Test
    void aggregatesBySuiteAndStatus() {
        AllureTestResult passed = parse(
                "{\"name\":\"a\",\"status\":\"passed\",\"labels\":[{\"name\":\"suite\",\"value\":\"batch-1\"}]}");
        AllureTestResult failed = parse(
                "{\"name\":\"b\",\"status\":\"failed\",\"labels\":[{\"name\":\"suite\",\"value\":\"batch-1\"}]}");
        AllureTestResult other = parse(
                "{\"name\":\"c\",\"status\":\"passed\",\"labels\":[{\"name\":\"suite\",\"value\":\"batch-2\"}]}");

        String json = SuitesJsonBuilder.fromResults(Arrays.asList(passed, failed, other));
        JsonObject root = JsonParser.parseString(json).getAsJsonObject();
        assertEquals(2, root.get("total").getAsInt());

        JsonArray items = root.get("items").getAsJsonArray();
        assertEquals(2, items.size());
        JsonObject first = items.get(0).getAsJsonObject();
        assertEquals("batch-1", first.get("name").getAsString());
        assertEquals(2, first.getAsJsonObject("statistic").get("total").getAsInt());
        assertEquals(1, first.getAsJsonObject("statistic").get("passed").getAsInt());
        assertEquals(1, first.getAsJsonObject("statistic").get("failed").getAsInt());
    }

    private static AllureTestResult parse(String json) {
        try {
            java.io.File temp = java.io.File.createTempFile("suite-result", ".json");
            java.nio.file.Files.write(temp.toPath(), json.getBytes());
            return new JSON().parseFile(temp, AllureTestResult.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
