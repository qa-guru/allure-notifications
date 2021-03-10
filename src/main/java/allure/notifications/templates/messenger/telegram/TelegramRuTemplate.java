package allure.notifications.templates.messenger.telegram;

import allure.notifications.templates.contract.Template;
import allure.notifications.templates.data.TemplateData;
import allure.notifications.utils.Utils;
import org.stringtemplate.v4.ST;

/**
 * Шаблон сообщения для telegram с html разметкой на русском
 *
 * @author kadehar
 * @since 2.0.5
 */
public class TelegramRuTemplate implements Template {
    private TelegramRuTemplate() {}

    public static TelegramRuTemplate newInstance() {
        return new TelegramRuTemplate();
    }

    @Override
    public ST message(TemplateData data) {
        long broken = data.getBroken();
        long unknown = data.getUnknown();
        long skipped = data.getSkipped();
        long percentOfFailed = data.getPercentOfFailed();
        long percentOfPassed = data.getPercentOfPassed();

        return new ST(
                "<open_bold>Результаты:<close_bold> \n" +
                        "<bullet> <open_bold>Запуск:<close_bold> " + data.getLaunchName() + '\n' +
                        "<bullet> <open_bold>Продолжительность:<close_bold> " + Utils.getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "<bullet> <open_bold>Всего сценариев:<close_bold> " + data.getTotal() + '\n' +
                        "<bullet> <open_bold>Рабочее окружение:<close_bold> " + data.getEnvironment() + '\n' +
                        "<bullet> <open_bold>Всего успешных тестов:<close_bold> " + data.getPassed() + '\n' +
                        "<bullet> <open_bold>Всего упавших тестов:<close_bold> " + data.getFailed() + '\n' +
                        (broken > 0 ? "<bullet> <open_bold>Всего сломанных тестов:<close_bold> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <open_bold>Всего неизвестных тестов:<close_bold> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <open_bold>Всего пропущенных тестов:<close_bold> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <open_bold>% упавших тестов:<close_bold> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <open_bold>% прошедших тестов:<close_bold> " + percentOfPassed + '\n' : "") +
                        "<open_bold>Отчет доступен по ссылке:<close_bold> " + data.getReportLink()
        );
    }
}
