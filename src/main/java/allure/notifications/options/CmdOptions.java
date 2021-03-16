package allure.notifications.options;

import allure.notifications.options.validation.NotEmptyOrNullString;
import com.beust.jcommander.Parameter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import static allure.notifications.utils.Utils.createStringFromListValues;

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
            description = "Set telegram bot token", required = true, validateWith = NotEmptyOrNullString.class)
    private String botToken;

    @Parameter(names = {"--chat", "-c", "--id"}, description = "Set telegram chat id",
            required = true, validateWith = NotEmptyOrNullString.class)
    private String chatId;

    @Parameter(names = {"-p", "--project"}, description = "Set project name",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private List<String> projectName;

    @Parameter(names = {"-f", "--folder", "--allure"}, description = "Set allure report folder",
            required = true, validateWith = NotEmptyOrNullString.class)
    private String allureReportFolder;

    @Parameter(names = {"-b", "--build", "--link"}, description = "Set link to build",
            required = true, validateWith = NotEmptyOrNullString.class)
    private String buildLink;

    @Parameter(names = {"-n", "--name"}, description = "Set launch name",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private List<String> launchName;

    @Parameter(names = {"-e", "--env"}, description = "Set environment",
            required = true, validateWith = NotEmptyOrNullString.class, variableArity = true)
    private List<String> environment;

    @Parameter(names = {"-l", "--lang"}, description = "Set template language",
            validateWith = NotEmptyOrNullString.class)
    private String lang = "en";

    @Parameter(names = {"-m", "--messenger"}, description = "Set messenger name", hidden = true)
    private String messenger = "telegram";

    @Parameter(names = {"-u", "--mmUrl"}, description = "Set mattermost URL", hidden = true)
    private String mattermostUrl;

    /** Возвращает значения, введённые пользователем. */
    public OptionsValues collectOptions() {
        OptionsValues values = new OptionsValues.Builder()
                .enableChart(chart)
                .botToken(botToken)
                .chatId(chatId)
                .project(createStringFromListValues(projectName))
                .reportFolder(allureReportFolder + "widgets/summary.json")
                .buildLink(buildLink +  "allure")
                .launch(createStringFromListValues(launchName))
                .environment(createStringFromListValues(environment))
                .language(lang)
                .messenger(messenger)
                .mattermostUrl(mattermostUrl)
                .build();
        logger.info("Options values: {}", values.toString());
        return values;
    }
}
