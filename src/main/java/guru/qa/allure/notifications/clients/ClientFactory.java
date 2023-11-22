package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.clients.rocket.RocketChatClient;
import java.util.ArrayList;
import java.util.List;

import guru.qa.allure.notifications.clients.discord.DiscordClient;
import guru.qa.allure.notifications.clients.loop.LoopClient;
import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.skype.SkypeClient;
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
            notifiers.add(new SlackClient(config.getSlack()));
        }
        if (config.getMail() != null) {
            notifiers.add(new Email(config.getMail()));
        }
        if (config.getMattermost() != null) {
            notifiers.add(new MattermostClient(config.getMattermost()));
        }
        if (config.getSkype() != null) {
            notifiers.add(new SkypeClient(config.getSkype()));
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
        return notifiers;
    }
}
