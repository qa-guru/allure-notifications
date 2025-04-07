package guru.qa.allure.notifications.config.proxy;

import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing proxy settings.
 */
@Data
public class Proxy {
    private String host;
    private Integer port;
    private String username;
    private String password;
}
