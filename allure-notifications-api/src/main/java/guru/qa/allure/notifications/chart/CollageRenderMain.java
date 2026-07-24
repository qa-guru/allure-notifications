package guru.qa.allure.notifications.chart;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Language;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.LocatedReport;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.ReportAnalyticsBuilder;
import guru.qa.allure.notifications.report.ReportLocator;
import guru.qa.allure.notifications.report.SummaryReader;

/**
 * Headless collage PNG export — no messengers, no browser, no {@code Application.main}.
 *
 * <p>Used by {@code gen_presets.py} and local dogfood:
 * <pre>
 * java -DconfigFile=config.json -cp allure-notifications.jar \
 *   guru.qa.allure.notifications.chart.CollageRenderMain
 * </pre>
 * Writes {@code chart.png} next to the config file and exits 0.
 */
public final class CollageRenderMain {

    private CollageRenderMain() {
    }

    public static void main(String[] args) throws Exception {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        Config config = applicationConfig.readConfig();
        Base base = config.getBase();
        if (base == null || !Boolean.TRUE.equals(base.getEnableChart())) {
            throw new IllegalStateException("base.enableChart must be true");
        }

        JSON json = new JSON();
        Language language = base.getLanguage() != null ? base.getLanguage() : Language.en;
        String lang = language.name();
        LocatedReport located = ReportLocator.locate(Paths.get(base.getAllureFolder()));
        Summary summary = SummaryReader.read(json, located);
        Legend legend = json.parseResource("/legend/" + lang + ".json", Legend.class);
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

        byte[] png = CollageRenderer.render(base, analytics, legend);
        Path out = Paths.get(applicationConfig.getConfigDirectory(), "chart.png");
        Files.write(out, png);
        System.out.println("chart.png " + out.toAbsolutePath() + " (" + png.length + " bytes)");
    }
}
