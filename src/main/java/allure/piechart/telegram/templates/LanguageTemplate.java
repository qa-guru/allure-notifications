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

        return "*" + language.resultsLabel() + ":* \n" +
                        "- *Launch:* " + data.getLaunchName() + '\n' +
                        "- *Duration:* " + getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "- *Total scenarios:* " + data.getTotal() + '\n' +
                        "- *Environment:* " + data.getEnvironment() + '\n' +
                        "- *Total passed:* " + data.getPassed() + '\n' +
                        "- *Total failed:* " + data.getFailed() + '\n' +
                        (broken > 0 ? "- *Total broken:* " + broken + '\n' : "") +
                        (unknown > 0 ? "- *Total unknown:* " + unknown + '\n' : "") +
                        (skipped > 0 ? "- *Total skipped:* " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "- *% of failed tests:* " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "- *% of passed tests:* " + percentOfPassed + '\n' : "") +
                        "*Report available by link:* " + data.getReportLink();
    }
}
