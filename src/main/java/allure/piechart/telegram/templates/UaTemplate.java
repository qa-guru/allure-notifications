package allure.piechart.telegram.templates;

import allure.piechart.telegram.templates.contract.Template;
import allure.piechart.telegram.templates.data.TemplateData;
import org.stringtemplate.v4.ST;

import static allure.piechart.telegram.utils.Utils.getTimeFromMilliseconds;

/**
 * Описывает шаблон сообщения на украинском
 *
 * @author GorbatenkoVA
 * @since 2.0.5
 */
public class UaTemplate implements Template {
    private UaTemplate() {}

    public static UaTemplate newInstance() {
        return new UaTemplate();
    }

    @Override
    public ST message(TemplateData data) {
        long broken = data.getBroken();
        long unknown = data.getUnknown();
        long skipped = data.getSkipped();
        long percentOfFailed = data.getPercentOfFailed();
        long percentOfPassed = data.getPercentOfPassed();

        return new ST(
                "<asterisk>Результати:<asterisk> \n" +
                        "<bullet> <asterisk>Запуск:<asterisk> " + data.getLaunchName() + '\n' +
                        "<bullet> <asterisk>Тривалість:<asterisk> " + getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "<bullet> <asterisk>Всього сценаріїв:<asterisk> " + data.getTotal() + '\n' +
                        "<bullet> <asterisk>Робоче оточення:<asterisk> " + data.getEnvironment() + '\n' +
                        "<bullet> <asterisk>Всього успішних тестів:<asterisk> " + data.getPassed() + '\n' +
                        "<bullet> <asterisk>Всього невдалих тестів:<asterisk> " + data.getFailed() + '\n' +
                        (broken > 0 ? "<bullet> <asterisk>Всього зламаних тестів:<asterisk> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <asterisk>Всього невідомих тестів:<asterisk> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <asterisk>Всього пропущених тестів:<asterisk> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <asterisk>% невдалих тестів:<asterisk> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <asterisk>% успішних тестів:<asterisk> " + percentOfPassed + '\n' : "") +
                        "<asterisk>Звіт доступний за посиланням:<asterisk> " + data.getReportLink()
        );
    }
}
