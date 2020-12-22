package allure.piechart.telegram.templates;

import allure.piechart.telegram.templates.contract.Template;
import allure.piechart.telegram.templates.data.TemplateData;
import org.stringtemplate.v4.ST;

import static allure.piechart.telegram.utils.Utils.getTimeFromMilliseconds;

/**
 * Описывает шаблон сообщения на английском
 *
 * @author kadehar
 * @since 2.0.2
 */
public class EngTemplate implements Template {
    private EngTemplate() {}

    public static EngTemplate newInstance() {
        return new EngTemplate();
    }

    @Override
    public ST message(TemplateData data) {
        long broken = data.getBroken();
        long unknown = data.getUnknown();
        long skipped = data.getSkipped();
        long percentOfFailed = data.getPercentOfFailed();
        long percentOfPassed = data.getPercentOfPassed();

        return new ST(
                "<asterisk>Results:<asterisk> \n" +
                        "<bullet> <asterisk>Launch:<asterisk> " + data.getLaunchName() + '\n' +
                        "<bullet> <asterisk>Duration:<asterisk> " + getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "<bullet> <asterisk>Total scenarios:<asterisk> " + data.getTotal() + '\n' +
                        "<bullet> <asterisk>Environment:<asterisk> " + data.getEnvironment() + '\n' +
                        "<bullet> <asterisk>Total passed:<asterisk> " + data.getPassed() + '\n' +
                        "<bullet> <asterisk>Total failed:<asterisk> " + data.getFailed() + '\n' +
                        (broken > 0 ? "<bullet> <asterisk>Total broken:<asterisk> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <asterisk>Total unknown:<asterisk> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <asterisk>Total skipped:<asterisk> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <asterisk>% of failed tests:<asterisk> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <asterisk>% of passed tests:<asterisk> " + percentOfPassed + '\n' : "") +
                        "<asterisk>Report available by link:<asterisk> " + data.getReportLink()
        );
    }
}
