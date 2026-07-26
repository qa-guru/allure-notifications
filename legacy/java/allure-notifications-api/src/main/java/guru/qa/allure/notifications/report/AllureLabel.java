package guru.qa.allure.notifications.report;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * Label from {@code *-result.json}.
 */
@Getter
public class AllureLabel {
    @SerializedName("name")
    private String name;

    @SerializedName("value")
    private String value;
}
