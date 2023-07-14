package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;
import lombok.Data;

import java.util.HashMap;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test summary from Allure Report.
 */
@Data
public class Summary {
    @SerializedName("statistic")
    private Statistic statistic;
    @SerializedName("time")
    private Time time;

    public static Summary getInstance(HashMap<String, Integer> statistic) {
        Summary summary = new Summary();
        Statistic stat = new Statistic();
        stat.setTotal(statistic.get("total"));
        stat.setFailed(statistic.get("failed"));
        stat.setBroken(statistic.get("broken"));
        stat.setPassed(statistic.get("passed"));
        stat.setSkipped(statistic.get("skipped"));
        stat.setUnknown(statistic.containsKey("unknown")?statistic.get("unknown"):0);
        summary.setStatistic(stat);
        return summary;
    }
}
