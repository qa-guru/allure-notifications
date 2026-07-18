package guru.qa.allure.notifications.report;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * Minimal model of a single test-case entry inside an Allure 3
 * {@code history.jsonl} run ({@code testResults[id]}).
 */
@Getter
public class HistoryTestResult {
    @SerializedName("id")
    private String id;

    @SerializedName("name")
    private String name;

    @SerializedName("status")
    private String status;
}
