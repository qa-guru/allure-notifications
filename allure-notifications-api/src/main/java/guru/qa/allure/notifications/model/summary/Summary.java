package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test summary from Allure Report.
 */
@Getter
public class Summary {
    @SerializedName("statistic")
    private Statistic statistic;
    @SerializedName("time")
    private Time time;
}
