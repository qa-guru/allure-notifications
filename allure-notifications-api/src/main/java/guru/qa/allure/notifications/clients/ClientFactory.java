package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.clients.gitlab.GitlabClient;
import guru.qa.allure.notifications.clients.rocket.RocketChatClient;
import java.util.ArrayList;
import java.util.List;

import guru.qa.allure.notifications.clients.cliq.CliqClient;
import guru.qa.allure.notifications.clients.discord.DiscordClient;
import guru.qa.allure.notifications.clients.loop.LoopClient;
import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.slack.SlackClient;
import guru.qa.allure.notifications.clients.telegram.TelegramClient;
import guru.qa.allure.notifications.config.Config;

public class ClientFactory {

    public static List<Notifier> from(Config config) {
        List<Notifier> notifiers =  new ArrayList<>();
        if (config.getTelegram() != null) {
            notifiers.add(new TelegramClient(config.getTelegram()));
        }
        if (config.getSlack() != null) {
            notifiers.add(new SlackClient(config.getSlack(), config.getProxy()));
        }
        if (config.getMail() != null) {
            notifiers.add(new Email(config.getMail()));
        }
        if (config.getMattermost() != null) {
            notifiers.add(new MattermostClient(config.getMattermost()));
        }
        if (config.getDiscord() != null) {
            notifiers.add(new DiscordClient(config.getDiscord()));
        }
        if (config.getLoop() != null) {
            notifiers.add(new LoopClient(config.getLoop()));
        }
        if (config.getRocketChat() != null) {
            notifiers.add(new RocketChatClient(config.getRocketChat()));
        }
        if (config.getCliq() != null) {
            notifiers.add(new CliqClient(config.getCliq(), config.getProxy()));
        }
        if (config.getGitlab() != null && Boolean.TRUE.equals(config.getGitlab().getEnabled())) {
            notifiers.add(new GitlabClient(config.getGitlab()));
        }
        return notifiers;
    }
}
