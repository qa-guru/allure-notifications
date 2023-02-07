package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test statistic from Allure Report.
 */
@Data
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor(access = AccessLevel.PUBLIC)
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
