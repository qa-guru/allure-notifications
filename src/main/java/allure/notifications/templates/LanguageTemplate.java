package allure.notifications.templates;

import allure.notifications.config.Language;
import org.aeonbits.owner.ConfigFactory;
import allure.notifications.templates.data.TemplateData;

import static allure.notifications.utils.Utils.getTimeFromMilliseconds;


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
                        "- *" + language.resultsLabel() + ":* " + data.getLaunchName() + '\n' +
                        "- *" + language.durationLabel() + ":* " + getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "- *" + language.totalScenariosLabel() + ":* " + data.getTotal() + '\n' +
                        "- *" + language.environmentLabel() + ":* " + data.getEnvironment() + '\n' +
                        "- *" + language.totalPassedLabel() + ":* " + data.getPassed() + '\n' +
                        "- *" + language.totalFailedLabel() + ":* " + data.getFailed() + '\n' +
                        (broken > 0 ? "- *" + language.totalBrokenLabel() + ":* " + broken + '\n' : "") +
                        (unknown > 0 ? "- *" + language.totalUnknownLabel() + ":* " + unknown + '\n' : "") +
                        (skipped > 0 ? "- *" + language.totalSkippedLabel() + ":* " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "- *% " + language.ofFailedTestsLabel() + ":* " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "- *% " + language.ofPassedTestsLabel() + ":* " + percentOfPassed + '\n' : "") +
                        "*" + language.reportsLinkLabel() + ":* " + data.getReportLink();
    }
}
