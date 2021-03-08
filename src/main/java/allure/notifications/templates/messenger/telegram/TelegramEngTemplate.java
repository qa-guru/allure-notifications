package allure.notifications.templates.messenger.telegram;

import allure.notifications.templates.contract.Template;
import allure.notifications.templates.data.TemplateData;
import allure.notifications.utils.Utils;
import org.stringtemplate.v4.ST;

/**
 * Шаблон сообщения для telegram с html разметкой на английском
 *
 * @author kadehar
 * @since 2.0.5
 */
public class TelegramEngTemplate implements Template {
    private TelegramEngTemplate() {}

    public static TelegramEngTemplate newInstance() {
        return new TelegramEngTemplate();
    }

    @Override
    public ST message(TemplateData data) {
        long broken = data.getBroken();
        long unknown = data.getUnknown();
        long skipped = data.getSkipped();
        long percentOfFailed = data.getPercentOfFailed();
        long percentOfPassed = data.getPercentOfPassed();

        return new ST(
                "<open_bold>Results:<close_bold> \n" +
                        "<bullet> <open_bold>Launch:<close_bold> " + data.getLaunchName() + '\n' +
                        "<bullet> <open_bold>Duration:<close_bold> " + Utils.getTimeFromMilliseconds(data.getDuration()) + '\n' +
                        "<bullet> <open_bold>Total scenarios:<close_bold> " + data.getTotal() + '\n' +
                        "<bullet> <open_bold>Environment:<close_bold> " + data.getEnvironment() + '\n' +
                        "<bullet> <open_bold>Total passed:<close_bold> " + data.getPassed() + '\n' +
                        "<bullet> <open_bold>Total failed:<close_bold> " + data.getFailed() + '\n' +
                        (broken > 0 ? "<bullet> <open_bold>Total broken:<close_bold> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <open_bold>Total unknown:<close_bold> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <open_bold>Total skipped:<close_bold> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <open_bold>% of failed tests:<close_bold> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <open_bold>% of passed tests:<close_bold> " + percentOfPassed + '\n' : "") +
                        "<open_bold>Report available by link:<close_bold> " + data.getReportLink()
        );
    }
}
