package allure.piechart.telegram.templates;

import allure.piechart.telegram.models.Summary;

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

    public MessageTemplate(final @NotNull Summary summary) {
        failed = summary.getStatistic().getFailed();
        broken = summary.getStatistic().getBroken();
        passed = summary.getStatistic().getPassed();
        unknown = summary.getStatistic().getUnknown();
        skipped = summary.getStatistic().getSkipped();
        total = summary.getStatistic().getTotal();
        duration = summary.getTime().getDuration();
    }

    /** Возвращает заполненное сообщение на английском языке. */
    public String engMessage(final @NotNull String launchName, final @NotNull String env,
                             final @NotNull String reportLink) {
        final long percentOfFailed = failed * 100 / total;
        final long percentOfPassed = passed * 100 / total;

        return "Results: \n" +
                "- Launch: " + launchName + '\n' +
                "- Duration: " + getTimeFromMilliseconds(duration) + '\n' +
                "- Total scenarios: " + total + '\n' +
                "- Environment: " + env + '\n' +
                "- Total passed: " + passed + '\n' +
                "- Total failed: " + failed + '\n' +
                (broken > 0 ? "- Total broken: " + broken + '\n' : "") +
                (unknown > 0 ? "- Total unknown: " + unknown + '\n' : "") +
                "- Total skipped: " + skipped + '\n' +
                "- % of failed tests: " + percentOfFailed + '\n' +
                "- % of passed tests: " + percentOfPassed + '\n' +
                "Report available by link: " + reportLink;
    }

    /** Возвращает заполненное сообщение на русском языке. */
    public String rusMessage(final @NotNull String launchName, final @NotNull String env,
                             final @NotNull String reportLink) {
        final long percentOfFailed = failed * 100 / total;
        final long percentOfPassed = passed * 100 / total;

        return "Результаты: \n" +
                "- Запуск: " + launchName + '\n' +
                "- Продолжительность: " + getTimeFromMilliseconds(duration) + '\n' +
                "- Всего сценариев: " + total + '\n' +
                "- Рабочее окружение: " + env + '\n' +
                "- Всего успешных тестов: " + passed + '\n' +
                "- Всего упавших тестов: " + failed + '\n' +
                (broken > 0 ? "- Всего сломанных тестов: " + broken + '\n' : "") +
                (unknown > 0 ? "- Всего неизвестных тестов: " + unknown + '\n' : "") +
                "- Всего пропущенных тестов: " + skipped + '\n' +
                "- % упавших тестов: " + percentOfFailed + '\n' +
                "- % прошедших тестов: " + percentOfPassed + '\n' +
                "Отчет доступен по ссылке: " + reportLink;
    }
}
