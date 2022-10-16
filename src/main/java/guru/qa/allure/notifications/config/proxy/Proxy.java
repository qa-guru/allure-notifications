package guru.qa.allure.notifications.config.proxy;

import com.google.gson.annotations.SerializedName;
import lombok.Builder;
import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing proxy settings.
 */
@Data
@Builder
public class Proxy {
    @SerializedName("host")
    private String host;
    @SerializedName("port")
    private Integer port;
    @SerializedName("username")
    private String username;
    @SerializedName("password")
    private String password;
}
