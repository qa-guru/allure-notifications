package allure.notifications.templates.messenger.mattermost;

import allure.notifications.templates.data.TemplateData;
import allure.notifications.templates.messenger.telegram.TelegramEngTemplate;
import allure.notifications.templates.messenger.telegram.TelegramRuTemplate;
import allure.notifications.templates.messenger.telegram.TelegramUaTemplate;
import org.stringtemplate.v4.ST;

/**
 * Управляет созданием форматированного сообщения для отправки в mattermost
 *
 * @author ferras777
 * @since 2.9.0
 */
public class Mattermost {
    public static String mattermostMessage(final String locale, final TemplateData data) {
        ST template;
        switch (locale.toLowerCase()) {
            case "ru":
                template = TelegramRuTemplate.newInstance().message(data);
                format(template);
                return template.render();
            case "en":
                template = TelegramEngTemplate.newInstance().message(data);
                format(template);
                return template.render();
            case "ua":
                template = TelegramUaTemplate.newInstance().message(data);
                format(template);
                return template.render();
            default:
                throw new IllegalStateException("Unexpected value: " + locale.toLowerCase());
        }
    }

    private static void format(ST template) {
        template.add("bullet", '-');
        template.add("open_bold", "*");
        template.add("close_bold", "*");
    }
}
