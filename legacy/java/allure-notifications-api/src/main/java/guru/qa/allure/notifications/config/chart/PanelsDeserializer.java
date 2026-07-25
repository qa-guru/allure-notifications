package guru.qa.allure.notifications.config.chart;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Deserialises {@code chart.panels} into a list of rows.
 *
 * <p>Accepts both a flat array of panel ids (treated as a single row) and a nested
 * array of rows:
 * <pre>
 *   "panels": ["pie", "testingPyramid"]                 -&gt; [["pie", "testingPyramid"]]
 *   "panels": [["pie", "testingPyramid"], ["durations"]] -&gt; as-is
 * </pre>
 * Non-string / non-array entries are ignored.
 */
public class PanelsDeserializer extends JsonDeserializer<List<List<String>>> {

    @Override
    public List<List<String>> deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        JsonNode node = parser.getCodec().readTree(parser);
        List<List<String>> rows = new ArrayList<List<String>>();
        if (node == null || !node.isArray()) {
            return rows;
        }

        List<String> flatRow = null;
        for (JsonNode element : node) {
            if (element.isArray()) {
                List<String> row = new ArrayList<String>();
                for (JsonNode item : element) {
                    if (item.isTextual()) {
                        row.add(item.asText());
                    }
                }
                rows.add(row);
            } else if (element.isTextual()) {
                if (flatRow == null) {
                    flatRow = new ArrayList<String>();
                }
                flatRow.add(element.asText());
            }
        }
        if (flatRow != null) {
            rows.add(flatRow);
        }
        return rows;
    }
}
