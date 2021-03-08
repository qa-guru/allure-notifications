package allure.notifications.templates.factory;

import allure.notifications.templates.data.TemplateData;
import allure.notifications.templates.messenger.slack.Slack;
import allure.notifications.templates.messenger.telegram.Telegram;

/**
 * Управляет созданием шаблонов сообщений.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TemplatesFactory {
    /** Возвращает отформатированное сообщение на выбранном языке. */
    public static String formattedMessage(final String messenger, final String lang, final TemplateData data) {
        switch (messenger.toLowerCase()) {
            case "telegram":
                return Telegram.tgMessage(lang, data);
            case "slack":
                return Slack.slackMessage(lang, data);
            default:
                throw new IllegalStateException("Unexpected value: " + messenger.toLowerCase());
        }
    }
}