package guru.qa.allure.notifications.config.mail;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing mail settings.
 */
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

    public String host() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String port() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String username() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String password() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean enableSSL() {
        return enableSSL;
    }

    public void setEnableSSL(Boolean enableSSL) {
        this.enableSSL = enableSSL;
    }

    public String from() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String recipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }
}
