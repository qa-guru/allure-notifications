package allure.piechart.telegram.templates;

import allure.piechart.telegram.models.Summary;
import org.stringtemplate.v4.ST;

import javax.validation.constraints.NotNull;

import static allure.piechart.telegram.utils.Utils.getTimeFromMilliseconds;

/**
 * Содержит шаблоны для ENG и RUS сообщений.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class MessageTemplate {
    private final long failed;
    private final long broken;
    private final long passed;
    private final long unknown;
    private final long skipped;
    private final long total;
    private final long duration;
    private final long percentOfFailed;
    private final long percentOfPassed;


    public MessageTemplate(final @NotNull Summary summary) {
        failed = summary.getStatistic().getFailed();
        broken = summary.getStatistic().getBroken();
        passed = summary.getStatistic().getPassed();
        unknown = summary.getStatistic().getUnknown();
        skipped = summary.getStatistic().getSkipped();
        total = summary.getStatistic().getTotal();
        duration = summary.getTime().getDuration();
        percentOfFailed = failed * 100 / total;
        percentOfPassed = passed * 100 / total;
    }

    /** Возвращает заполненное сообщение на английском языке. */
    public ST engMessage(final @NotNull String launchName, final @NotNull String env,
                         final @NotNull String reportLink) {
        return new ST(
                "<asterisk>Results:<asterisk> \n" +
                        "<bullet> <asterisk>Launch:<asterisk> " + launchName + '\n' +
                        "<bullet> <asterisk>Duration:<asterisk> " + getTimeFromMilliseconds(duration) + '\n' +
                        "<bullet> <asterisk>Total scenarios:<asterisk> " + total + '\n' +
                        "<bullet> <asterisk>Environment:<asterisk> " + env + '\n' +
                        "<bullet> <asterisk>Total passed:<asterisk> " + passed + '\n' +
                        "<bullet> <asterisk>Total failed:<asterisk> " + failed + '\n' +
                        (broken > 0 ? "<bullet> <asterisk>Total broken:<asterisk> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <asterisk>Total unknown:<asterisk> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <asterisk>Total skipped:<asterisk> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <asterisk>% of failed tests:<asterisk> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <asterisk>% of passed tests:<asterisk> " + percentOfPassed + '\n' : "") +
                        "<asterisk>Report available by link:<asterisk> " + reportLink
        );
    }

    /** Возвращает заполненное сообщение на русском языке. */
    public ST rusMessage(final @NotNull String launchName, final @NotNull String env,
                         final @NotNull String reportLink) {
        return new ST(
                "<asterisk>Результаты:<asterisk> \n" +
                        "<bullet> <asterisk>Запуск:<asterisk> " + launchName + '\n' +
                        "<bullet> <asterisk>Продолжительность:<asterisk> " + getTimeFromMilliseconds(duration) + '\n' +
                        "<bullet> <asterisk>Всего сценариев:<asterisk> " + total + '\n' +
                        "<bullet> <asterisk>Рабочее окружение:<asterisk> " + env + '\n' +
                        "<bullet> <asterisk>Всего успешных тестов:<asterisk> " + passed + '\n' +
                        "<bullet> <asterisk>Всего упавших тестов:<asterisk> " + failed + '\n' +
                        (broken > 0 ? "<bullet> <asterisk>Всего сломанных тестов:<asterisk> " + broken + '\n' : "") +
                        (unknown > 0 ? "<bullet> <asterisk>Всего неизвестных тестов:<asterisk> " + unknown + '\n' : "") +
                        (skipped > 0 ? "<bullet> <asterisk>Всего пропущенных тестов:<asterisk> " + skipped + '\n' : "") +
                        (percentOfFailed > 0 ? "<bullet> <asterisk>% упавших тестов:<asterisk> " + percentOfFailed + '\n' : "") +
                        (percentOfPassed > 0 ? "<bullet> <asterisk>% прошедших тестов:<asterisk> " + percentOfPassed + '\n' : "") +
                        "<asterisk>Отчет доступен по ссылке:<asterisk> " + reportLink
        );
    }
}
