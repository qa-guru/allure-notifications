package guru.qa.allure.notifications.config.mail;

import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing mail settings.
 */
@Data
public class Mail {
    private String host;
    private String port;
    private String username;
    private String password;
    private SecurityProtocol securityProtocol;
    private String from;
    private String to;
    private String cc;
    private String bcc;
    private String recipient;
    private String templatePath = "/templates/html.ftl";
}
