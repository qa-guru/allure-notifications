package allure.piechart.telegram.templates.messenger.slack;

import allure.piechart.telegram.templates.data.TemplateData;
import allure.piechart.telegram.templates.messenger.telegram.TelegramEngTemplate;
import allure.piechart.telegram.templates.messenger.telegram.TelegramRuTemplate;
import allure.piechart.telegram.templates.messenger.telegram.TelegramUaTemplate;
import org.stringtemplate.v4.ST;

/**
 * Управляет созданием форматированного сообщения для отправки в telegram
 *
 * @author svasenkov
 * @since 2.0.6
 */
public class Slack {
    public static String slackMessage(final String locale, final TemplateData data) {
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
        template.add("bullet", '\u2022');
        template.add("open_bold", "<b>");
        template.add("close_bold", "</b>");
    }
}
