package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test statistic from Allure Report.
 */
@Getter
public class Statistic {
    @SerializedName("passed")
    private Integer passed;
    @SerializedName("failed")
    private Integer failed;
    @SerializedName("broken")
    private Integer broken;
    @SerializedName("skipped")
    private Integer skipped;
    @SerializedName("unknown")
    private Integer unknown;
    @SerializedName("total")
    private Integer total;
}
