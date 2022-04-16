package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test duration from Allure Report.
 */
public class Time {
    @SerializedName("duration")
    private Long duration;

    public Long duration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }
}
