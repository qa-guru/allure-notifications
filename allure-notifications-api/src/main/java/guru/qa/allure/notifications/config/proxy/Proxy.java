package guru.qa.allure.notifications.config.proxy;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing proxy settings.
 */
@Accessors(chain = true)
@Setter
@Getter
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
