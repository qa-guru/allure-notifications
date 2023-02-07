package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.testops.TestOps;
import guru.qa.allure.notifications.formatters.Formatters;
import guru.qa.allure.notifications.util.TestOpsClient;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping build data for template.
 */
@Slf4j
public class BuildData implements TemplateData {
    private final Base base;
    private final TestOps testOps;

    public BuildData(Base base) {
        this.base = base;
        this.testOps = null;
    }

    public BuildData(Base base, TestOps testOps) {
        this.base = base;
        this.testOps = testOps;
    }

    @Override
    public Map<String, Object> map() {
        log.info("Collecting build data for template");
        Map<String, Object> info = new HashMap<>();
        info.put("env", base.getEnvironment());
        info.put("comm", base.getComment());
        if (base.getEnableTestOpsIntegration()) {
            TestOpsClient testOpsClient = new TestOpsClient(testOps);
            String launchId = testOpsClient.getLastLaunchId();
            String testOpsLink = String.format("%s/launch/%s", testOps.getUrl(), launchId);
            info.put("reportLink", testOpsLink);
        }
        else {
            info.put("reportLink",
                    new Formatters().formatReportLink(base.getReportLink()));
        }
        log.info("Build data: {}", info);
        return info;
    }
}
