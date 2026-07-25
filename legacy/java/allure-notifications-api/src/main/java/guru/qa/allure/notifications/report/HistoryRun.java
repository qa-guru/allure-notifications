package guru.qa.allure.notifications.report;

import java.util.Collections;
import java.util.Map;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * Minimal model of a single line in an Allure 3 {@code history.jsonl}
 * (one line = one run snapshot).
 */
@Getter
public class HistoryRun {
    @SerializedName("uuid")
    private String uuid;

    @SerializedName("name")
    private String name;

    @SerializedName("timestamp")
    private Long timestamp;

    @SerializedName("testResults")
    private Map<String, HistoryTestResult> testResults;

    public Map<String, HistoryTestResult> getTestResults() {
        return testResults == null ? Collections.<String, HistoryTestResult>emptyMap() : testResults;
    }
}
