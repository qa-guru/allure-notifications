package guru.qa.allure.notifications.config;

import com.google.gson.annotations.SerializedName;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.config.mattermost.Mattermost;
import guru.qa.allure.notifications.config.proxy.Proxy;
import guru.qa.allure.notifications.config.rocket.Rocket;
import guru.qa.allure.notifications.config.skype.Skype;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.config.testops.TestOps;
import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing whole config.
 */
@Data
public class Config {
    @SerializedName("base")
    private Base base;
    @SerializedName("telegram")
    private Telegram telegram;
    @SerializedName("slack")
    private Slack slack;
    @SerializedName("mattermost")
    private Mattermost mattermost;
    @SerializedName("skype")
    private Skype skype;
    @SerializedName("mail")
    private Mail mail;
    @SerializedName("rocket")
    private Rocket rocket;
    @SerializedName("testOps")
    private TestOps testops;
    @SerializedName("proxy")
    private Proxy proxy;
}
