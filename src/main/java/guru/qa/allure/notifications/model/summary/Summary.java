package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test summary from Allure Report.
 */
public class Summary {
    @SerializedName("statistic")
    private Statistic statistic;
    @SerializedName("time")
    private Time time;

    public Statistic statistic() {
        return statistic;
    }

    public void setStatistic(Statistic statistic) {
        this.statistic = statistic;
    }

    public Time time() {
        return time;
    }

    public void setTime(Time time) {
        this.time = time;
    }
}
