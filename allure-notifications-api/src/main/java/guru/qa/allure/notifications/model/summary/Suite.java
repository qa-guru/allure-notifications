package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;

import lombok.Getter;

@Getter
public class Suite {
    @SerializedName("name")
    private String name;
    @SerializedName("statistic")
    private Statistic statistic;
}
