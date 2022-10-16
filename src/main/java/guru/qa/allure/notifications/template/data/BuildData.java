package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.formatters.Formatters;
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

    public BuildData(Base base) {
        this.base = base;
    }

    @Override
    public Map<String, Object> map() {
        log.info("Collecting build data for template");
        Map<String, Object> info = new HashMap<>();
        info.put("env", base.getEnvironment());
        info.put("comm", base.getComment());
        info.put("reportLink",
                new Formatters().formatReportLink(base.getReportLink()));
        log.info("Build data: {}", info);
        return info;
    }
}
