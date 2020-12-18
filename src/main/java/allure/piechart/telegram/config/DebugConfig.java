package allure.piechart.telegram.config;

import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        "system:properties",
        "classpath:debug.properties",
        "file:~/debug.properties",
        "file:./debug.properties"
})
public interface DebugConfig extends Config {
    @Key("chat.id")
    String chatId();
    @Key("bot.secret")
    String botSecret();
    @Key("project.name")
    String projectName();
    @Key("allure.report.folder")
    String allureReportFolder();
    @Key("build.link")
    String buildLink();
    @Key("launch.name")
    String launchName();
    @Key("env")
    String environment();
    @Key("enable.chart")
    Boolean enableChart();
    @Key("language")
    String language();
    @Key("messenger")
    String messenger();
}
