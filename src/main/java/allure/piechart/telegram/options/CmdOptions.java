package allure.piechart.telegram.options;

import allure.piechart.telegram.options.validation.NotEmptyOrNullString;
import com.beust.jcommander.Parameter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Содержит пользовательские флаги для работы с консолью.
 *
 * @author kadehar
 * @since 2.0
 */
public class CmdOptions {
    private final Logger logger = LoggerFactory.getLogger(CmdOptions.class);

    @Parameter(names = {"-ch", "--chart"}, description = "Enable/disable PieChart diagram", arity = 1)
    private boolean chart;

    @Parameter(names = {"-s", "--secret", "--token"},
            description = "Set telegram bot token", required = true, validateWith = NotEmptyOrNullString.class,
            variableArity = true)
    private String botToken;

    @Parameter(names = {"--chat", "-c", "--id"}, description = "Set telegram chat id",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private String chatId;

    @Parameter(names = {"-p", "--project"}, description = "Set project name",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private String projectName;

    @Parameter(names = {"-f", "--folder", "--allure"}, description = "Set allure report folder",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private String allureReportFolder;

    @Parameter(names = {"-b", "--build", "--link"}, description = "Set link to build",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private String buildLink;

    @Parameter(names = {"-n", "--name"}, description = "Set launch name",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private String launchName;

    @Parameter(names = {"-e", "--env"}, description = "Set environment",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private String environment;

    @Parameter(names = {"-l", "--lang"}, description = "Set template language",
            validateWith = NotEmptyOrNullString.class, variableArity = true)
    private String lang = "en";

    @Parameter(names = {"-m", "--messenger"}, description = "Set messenger name", hidden = true, variableArity = true)
    private String messenger = "telegram";

    /** Возвращает значения, введённые пользователем. */
    public OptionsValues collectOptions() {
        OptionsValues values = new OptionsValues.Builder()
                .enableChart(chart)
                .botToken(botToken)
                .chatId(chatId)
                .project(projectName)
                .reportFolder(allureReportFolder + "widgets/summary.json")
                .buildLink(buildLink +  "allure")
                .launch(launchName)
                .environment(environment)
                .language(lang)
                .messenger(messenger)
                .build();
        logger.info("Options values: {}", values.toString());
        return values;
    }
}
