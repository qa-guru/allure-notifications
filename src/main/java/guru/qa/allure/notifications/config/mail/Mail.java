package guru.qa.allure.notifications.config.mail;

import com.google.gson.annotations.SerializedName;
import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing mail settings.
 */
@Data
public class Mail {
    @SerializedName("host")
    private String host;
    @SerializedName("port")
    private String port;
    @SerializedName("username")
    private String username;
    @SerializedName("password")
    private String password;
    @SerializedName("enableSSL")
    private Boolean enableSSL;
    @SerializedName("from")
    private String from;
    @SerializedName("recipient")
    private String recipient;
}
