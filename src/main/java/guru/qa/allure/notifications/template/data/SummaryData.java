package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.formatters.Formatters;
import guru.qa.allure.notifications.mapper.SummaryMapper;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.util.Percentage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping summary data for template.
 */
public class SummaryData implements TemplateData {
    private static final Logger LOG =
            LoggerFactory.getLogger(SummaryData.class);
    private final Summary summary = new SummaryMapper().map();

    @Override
    public Map<String, Object> map() {
        LOG.info("Collecting summary data for template");
        Map<String, Object> info = new HashMap<>();
        info.put("time", new Formatters().formatTime(summary.time()
                .duration()));
        info.put("total", summary.statistic().total());
        info.put("passed", summary.statistic().passed());
        info.put("failed", summary.statistic().failed());
        info.put("broken", summary.statistic().broken());
        info.put("unknown", summary.statistic().unknown());
        info.put("skipped", summary.statistic().skipped());
        info.put("passedPercentage",
                new Percentage().eval(summary.statistic().passed(),
                        summary.statistic().total()));
        info.put("failedPercentage",
                new Percentage().eval(summary.statistic().failed(),
                        summary.statistic().total()));
        LOG.info("Summary data: {}", info);
        return null;
    }
}
