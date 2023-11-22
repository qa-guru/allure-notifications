package guru.qa.allure.notifications.clients.discord;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.discord.Discord;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;

public class DiscordClient implements Notifier {
    private final Discord discord;

    public DiscordClient(Discord discord) {
        this.discord = discord;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        Unirest.post("https://discord.com/api/channels/{channelId}/messages")
                .routeParam("channelId", discord.getChannelId())
                .header("Authorization", "Bot " + discord.getBotToken())
                .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                .field("content", new MarkdownTemplate(messageData).create())
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        Unirest.post("https://discord.com/api/channels/{channelId}/messages")
                .routeParam("channelId", discord.getChannelId())
                .header("Authorization", "Bot " + discord.getBotToken())
                .field("file", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .field("content", new MarkdownTemplate(messageData).create())
                .asString()
                .getBody();
    }
}
