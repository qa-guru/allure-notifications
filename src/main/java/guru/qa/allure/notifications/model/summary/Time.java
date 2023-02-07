package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;
import lombok.Data;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test duration from Allure Report.
 */
@Data
public class Time {
    @SerializedName("duration")
    private Long duration;
}
