package allure.piechart.telegram.templates.messenger.telegram;

import allure.piechart.telegram.templates.contract.Template;
import allure.piechart.telegram.templates.data.TemplateData;
import org.stringtemplate.v4.ST;

import static allure.piechart.telegram.utils.Utils.getTimeFromMilliseconds;

/**
 * Шаблон сообщения для telegram с html разметкой на украинском
 *
 * @author GorbatenkoVA
 * @since 2.0.5
 */
public class TelegramUaTemplate implements Template {
    private TelegramUaTemplate() {}

    public static TelegramUaTemplate newInstance() {
        return new TelegramUaTemplate();
    }

    @Override
    public ST message(TemplateData data) {
        long broken = data.getBroken();
        long unknown = data.getUnknown();
        long skipped = data.getSkipped();
        long percentOfFailed = data.getPercentOfFailed();
        long percentOfPassed = data.getPercentOfPassed();

        return new ST(
                "<open_bold>Результати:<close_bold> \n" +
                        "<bullet> <open_bold>Запуск:<close_bold> " + data.getLaunchName() + '\n' +
                        "<bullet> <open_bold>Тривалість:<close_bold> " + getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "<bullet> <open_bold>Усього сценаріїв:<close_bold> " + data.getTotal() + '\n' +
                        "<bullet> <open_bold>Середовище:<close_bold> " + data.getEnvironment() + '\n' +
                        "<bullet> <open_bold>Усього успішних тестів:<close_bold> " + data.getPassed() + '\n' +
                        "<bullet> <open_bold>Усього невдалих тестів:<close_bold> " + data.getFailed() + '\n' +
                        (broken > 0 ? "<bullet> <open_bold>Усього зламаних тестів:<close_bold> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <open_bold>Усього невідомих тестів:<close_bold> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <open_bold>Усього пропущених тестів:<close_bold> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <open_bold>% невдалих тестів:<close_bold> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <open_bold>% успішних тестів:<close_bold> " + percentOfPassed + '\n' : "") +
                        "<open_bold>Звіт доступний за посиланням:<close_bold> " + data.getReportLink()
        );
    }
}
