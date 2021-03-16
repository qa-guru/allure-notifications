package allure.notifications.clients;

import allure.notifications.models.Summary;
import allure.notifications.options.OptionsValues;
import allure.notifications.templates.data.TemplateData;
import allure.notifications.templates.factory.TemplatesFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;

import static allure.notifications.utils.Utils.getBuildSummary;
import static allure.notifications.utils.Utils.getTemplateData;

/**
 * Базовый клиент для отправки сообщения в чат.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class BaseClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(BaseClient.class);

    /**
     * Отправляет сообщения с пользовательскими параметрами в чат.
     *
     * @param values данные, введённые пользователем в командной строке
     */
    public static void sendMessage(final @NotNull OptionsValues values) {
        final Summary summary = getBuildSummary(values.getAllureReportFolder());
        final TemplateData data = getTemplateData(summary, values.getLaunchName(),
                values.getEnv(), values.getBuildLink());
        final String text = TemplatesFactory.formattedMessage(values.getMessenger(), values.getLanguage(), data);
        send(values, summary, text);
    }

    private static void send(final @NotNull OptionsValues values, final @NotNull Summary summary,
                             final @NotNull String text) {
        switch (values.getMessenger().toLowerCase()) {
            case "telegram":
                LOGGER.info("Send message to telegram");
                TelegramClient.sendMessageToTelegram(values, summary, text);
                LOGGER.info("Done");
                break;
            case "slack":
                LOGGER.info("Send message to slack");
                SlackClient.sendMessageToSlack(values, summary, text);
                LOGGER.info("Done");
                break;
            case "mattermost":
                LOGGER.info("Send message to mattermost");
                MattermostClient.sendMessageToMattermost(values, summary, text);
                LOGGER.info("Done");
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + values.getMessenger().toLowerCase());
        }
    }
}
