package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.formatters.Formatters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping build data for template.
 */
public class BuildData implements TemplateData {
    private static final Logger LOG =
            LoggerFactory.getLogger(BuildData.class);
    private final Base base = ApplicationConfig.newInstance()
            .readConfig().base();

    @Override
    public Map<String, Object> map() {
        LOG.info("Collecting build data for template");
        Map<String, Object> info = new HashMap<>();
        info.put("env", base.environment());
        info.put("comm", base.comment());
        info.put("reportLink",
                new Formatters().formatReportLink(base.reportLink()));
        LOG.info("Build data: {}", info);
        return info;
    }
}
