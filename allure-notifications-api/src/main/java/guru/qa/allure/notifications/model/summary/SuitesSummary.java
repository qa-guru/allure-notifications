package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;
import java.util.List;

import lombok.Getter;

@Getter
public class SuitesSummary {
    @SerializedName("total")
    private String total;
    @SerializedName("items")
    private List<Suite> suites;
}
