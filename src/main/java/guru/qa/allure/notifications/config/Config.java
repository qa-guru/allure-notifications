package guru.qa.allure.notifications.config;

import com.google.gson.annotations.SerializedName;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.config.mattermost.Mattermost;
import guru.qa.allure.notifications.config.proxy.Proxy;
import guru.qa.allure.notifications.config.skype.Skype;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.config.telegram.Telegram;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing whole config.
 */
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
    @SerializedName("proxy")
    private Proxy proxy;

    public Base base() {
        return base;
    }

    public void setBase(Base base) {
        this.base = base;
    }

    public Telegram telegram() {
        return telegram;
    }

    public void setTelegram(Telegram telegram) {
        this.telegram = telegram;
    }

    public Slack slack() {
        return slack;
    }

    public void setSlack(Slack slack) {
        this.slack = slack;
    }

    public Mattermost mattermost() {
        return mattermost;
    }

    public void setMattermost(Mattermost mattermost) {
        this.mattermost = mattermost;
    }

    public Skype skype() {
        return skype;
    }

    public void setSkype(Skype skype) {
        this.skype = skype;
    }

    public Mail mail() {
        return mail;
    }

    public void setMail(Mail mail) {
        this.mail = mail;
    }

    public Proxy proxy() {
        return proxy;
    }

    public void setProxy(Proxy proxy) {
        this.proxy = proxy;
    }
}
