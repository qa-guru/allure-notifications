package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.testops.TestOps;
import guru.qa.allure.notifications.formatters.Formatters;
import guru.qa.allure.notifications.mapper.SummaryMapper;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.util.Percentage;
import guru.qa.allure.notifications.util.TestOpsClient;
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

    private final SummaryMapper summaryMapper;
    private final TestOps testOps;

    public SummaryData(Base base) {
        this.summaryMapper = new SummaryMapper(base);
        this.testOps = null;
    }

    public SummaryData(Base base, TestOps testOps) {
        this.summaryMapper = new SummaryMapper(base);
        this.testOps = testOps;
    }

    @Override
    public Map<String, Object> map() {
        log.info("Collecting summary data for template");
        Summary summary;
        if (testOps != null) {
            TestOpsClient testOpsClient = new TestOpsClient(testOps);
            HashMap<String, Integer> statistics = testOpsClient.getLaunchStatistic();
            summary = Summary.getInstance(statistics);
        }
        else {
            summary = summaryMapper.map();
        }
        Map<String, Object> info = new HashMap<>();
        if (testOps == null) {
            info.put("time", new Formatters().formatTime(summary.getTime()
                    .getDuration()));
            info.put("passedPercentage",
                    new Percentage().eval(summary.getStatistic().getPassed(),
                            summary.getStatistic().getTotal()));
            info.put("failedPercentage",
                    new Percentage().eval(summary.getStatistic().getFailed(),
                            summary.getStatistic().getTotal()));
        }
        info.put("total", summary.getStatistic().getTotal());
        info.put("passed", summary.getStatistic().getPassed());
        info.put("failed", summary.getStatistic().getFailed());
        info.put("broken", summary.getStatistic().getBroken());
        info.put("unknown", summary.getStatistic().getUnknown());
        info.put("skipped", summary.getStatistic().getSkipped());
        log.info("Summary data: {}", info);
        return info;
    }
}
