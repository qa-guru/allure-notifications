package allure.piechart.telegram.templates;

import allure.piechart.telegram.templates.contract.Template;
import allure.piechart.telegram.templates.data.TemplateData;
import org.stringtemplate.v4.ST;

import static allure.piechart.telegram.utils.Utils.getTimeFromMilliseconds;

/**
 * Описывает шаблон сообщения на русском
 *
 * @author kadehar
 * @since 2.0.2
 */
public class RuTemplate implements Template {
    private RuTemplate() {}

    public static RuTemplate newInstance() {
        return new RuTemplate();
    }

    @Override
    public ST message(TemplateData data) {
        long broken = data.getBroken();
        long unknown = data.getUnknown();
        long skipped = data.getSkipped();
        long percentOfFailed = data.getPercentOfFailed();
        long percentOfPassed = data.getPercentOfPassed();

        return new ST(
                "<asterisk>Результаты:<asterisk> \n" +
                        "<bullet> <asterisk>Запуск:<asterisk> " + data.getLaunchName() + '\n' +
                        "<bullet> <asterisk>Продолжительность:<asterisk> " + getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "<bullet> <asterisk>Всего сценариев:<asterisk> " + data.getTotal() + '\n' +
                        "<bullet> <asterisk>Рабочее окружение:<asterisk> " + data.getEnvironment() + '\n' +
                        "<bullet> <asterisk>Всего успешных тестов:<asterisk> " + data.getPassed() + '\n' +
                        "<bullet> <asterisk>Всего упавших тестов:<asterisk> " + data.getFailed() + '\n' +
                        (broken > 0 ? "<bullet> <asterisk>Всего сломанных тестов:<asterisk> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <asterisk>Всего неизвестных тестов:<asterisk> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <asterisk>Всего пропущенных тестов:<asterisk> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <asterisk>% упавших тестов:<asterisk> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <asterisk>% прошедших тестов:<asterisk> " + percentOfPassed + '\n' : "") +
                        "<asterisk>Отчет доступен по ссылке:<asterisk> " + data.getReportLink()
        );
    }
}
