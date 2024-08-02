package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.formatters.Formatters;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.util.Percentage;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping summary data for template.
 */
@Slf4j
public class SummaryData implements TemplateData {

    private final Base base;
    private final Summary summary;

    public SummaryData(Base base, Summary summary) {
        this.base = base;
        this.summary = summary;
    }

    @Override
    public Map<String, Object> map() {
        log.info("Collecting summary data for template");
        Map<String, Object> info = new HashMap<>();
        info.put("time", Formatters.formatDuration(summary.getTime().getDuration(), base.getDurationFormat()));
        info.put("total", summary.getStatistic().getTotal());
        info.put("passed", summary.getStatistic().getPassed());
        info.put("failed", summary.getStatistic().getFailed());
        info.put("broken", summary.getStatistic().getBroken());
        info.put("unknown", summary.getStatistic().getUnknown());
        info.put("skipped", summary.getStatistic().getSkipped());
        info.put("passedPercentage",
                new Percentage().eval(summary.getStatistic().getPassed(),
                        summary.getStatistic().getTotal()));
        info.put("failedPercentage",
                new Percentage().eval(summary.getStatistic().getFailed(),
                        summary.getStatistic().getTotal()));
        log.info("Summary data: {}", info);
        return info;
    }
}
