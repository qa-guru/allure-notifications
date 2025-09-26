package guru.qa.allure.notifications.config;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.config.discord.Discord;
import guru.qa.allure.notifications.config.gitlab.Gitlab;
import guru.qa.allure.notifications.config.loop.Loop;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.config.mattermost.Mattermost;
import guru.qa.allure.notifications.config.proxy.Proxy;
import guru.qa.allure.notifications.config.rocket.RocketChat;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.config.telegram.Telegram;
import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing whole config.
 */
@Data
public class Config {
    private Base base;
    private Telegram telegram;
    private Slack slack;
    private Mattermost mattermost;
    private Mail mail;
    private Discord discord;
    private Loop loop;
    private RocketChat rocketChat;
    private Cliq cliq;
    private Proxy proxy;
    private Gitlab gitlab;
}
