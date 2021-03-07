package allure.piechart.telegram.templates;

import allure.piechart.telegram.templates.data.TemplateData;
import org.aeonbits.owner.ConfigFactory;

import static allure.piechart.telegram.utils.Utils.getTimeFromMilliseconds;

/**
 * Шаблон сообщения
 *
 * @author kadehar
 * @since 2.0.5
 */
public class LanguageTemplate {

    static Language language = ConfigFactory.newInstance().create(Language.class);

    public static String buildMessage(TemplateData data) {
        long broken = data.getBroken();
        long unknown = data.getUnknown();
        long skipped = data.getSkipped();
        long percentOfFailed = data.getPercentOfFailed();
        long percentOfPassed = data.getPercentOfPassed();

        return "<open_bold>" + language.resultsLabel() + ":<close_bold> \n" +
                        "<bullet> <open_bold>Launch:<close_bold> " + data.getLaunchName() + '\n' +
                        "<bullet> <open_bold>Duration:<close_bold> " + getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "<bullet> <open_bold>Total scenarios:<close_bold> " + data.getTotal() + '\n' +
                        "<bullet> <open_bold>Environment:<close_bold> " + data.getEnvironment() + '\n' +
                        "<bullet> <open_bold>Total passed:<close_bold> " + data.getPassed() + '\n' +
                        "<bullet> <open_bold>Total failed:<close_bold> " + data.getFailed() + '\n' +
                        (broken > 0 ? "<bullet> <open_bold>Total broken:<close_bold> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <open_bold>Total unknown:<close_bold> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <open_bold>Total skipped:<close_bold> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <open_bold>% of failed tests:<close_bold> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <open_bold>% of passed tests:<close_bold> " + percentOfPassed + '\n' : "") +
                        "<open_bold>Report available by link:<close_bold> " + data.getReportLink();
    }
}
