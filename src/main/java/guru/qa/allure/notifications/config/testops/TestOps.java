package guru.qa.allure.notifications.config.testops;

import com.google.gson.annotations.SerializedName;
import lombok.Data;

/**
 * @author GerasimchukDV
 * @since 4.2.2
 * Model class representing Allure TestOps client settings.
 */

@Data
public class TestOps {
    @SerializedName("url")
    private String url;
    @SerializedName("auth_token")
    private String auth_token;

    @SerializedName("xsrf_token")
    private String xsrf_token;
    @SerializedName("project_id")
    private String projectId;
}
