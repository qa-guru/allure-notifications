package guru.qa.allure.notifications.config.proxy;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing proxy settings.
 */
public class Proxy {
    @SerializedName("host")
    private String host;
    @SerializedName("port")
    private Integer port;
    @SerializedName("username")
    private String username;
    @SerializedName("password")
    private String password;

    public String host() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public Integer port() {
        return port;
    }

    public void setPort(Integer port) {
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
}
