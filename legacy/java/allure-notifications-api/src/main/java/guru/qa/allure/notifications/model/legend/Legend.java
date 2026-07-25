package guru.qa.allure.notifications.model.legend;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 4.0
 * Model class, representing chart legend phrases.
 */
@Getter
public class Legend {
    @SerializedName("passed")
    private String passed;
    @SerializedName("failed")
    private String failed;
    @SerializedName("broken")
    private String broken;
    @SerializedName("unknown")
    private String unknown;
    @SerializedName("skipped")
    private String skipped;
}
