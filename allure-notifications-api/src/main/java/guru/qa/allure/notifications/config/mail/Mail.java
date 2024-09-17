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
    @SerializedName("securityProtocol")
    private SecurityProtocol securityProtocol;
    @SerializedName("from")
    private String from;
    @SerializedName("to")
    private String to;
    @SerializedName("cc")
    private String cc;
    @SerializedName("bcc")
    private String bcc;
    @SerializedName("recipient")
    private String recipient;
    @SerializedName("templatePath")
    private String templatePath = "/templates/html.ftl";
}
