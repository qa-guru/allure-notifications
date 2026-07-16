package guru.qa.allure.notifications.report;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import guru.qa.allure.notifications.chart.PyramidLayerColors;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.model.summary.Summary;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

/**
 * Builds {@link ReportAnalytics} from report summary and allure-results files.
 */
@Slf4j
public final class ReportAnalyticsBuilder {
    static final int DEFAULT_TOP_SUITES = 10;

    private ReportAnalyticsBuilder() {
    }

    public static ReportAnalytics build(Base base, Summary summary) {
        Path allureFolder = Paths.get(base.getAllureFolder());
        Path resultsFolder = AllureResultsReader.resolveResultsFolder(base.getAllureResultsFolder(), allureFolder);
        List<AllureTestResult> results = AllureResultsReader.read(new JSON(), resultsFolder);
        return build(summary, results);
    }

    public static ReportAnalytics build(Summary summary, List<AllureTestResult> results) {
        return build(summary, results, DEFAULT_TOP_SUITES);
    }

    public static ReportAnalytics build(Summary summary, List<AllureTestResult> results, int topSuites) {
        Statistic statistic = summary != null ? summary.getStatistic() : null;
        boolean hasLayerLabels = false;
        boolean hasKnownLayerLabels = false;
        Map<String, Integer> layerCounts = new LinkedHashMap<String, Integer>();
        Map<String, Integer> suiteCounts = new LinkedHashMap<String, Integer>();
        List<Long> durations = new ArrayList<Long>();

        if (results != null) {
            for (AllureTestResult result : results) {
                String layer = result.getLayer();
                if (StringUtils.isNotBlank(layer)) {
                    hasLayerLabels = true;
                    String key = layer.trim().toLowerCase(Locale.ROOT);
                    if (PyramidLayerColors.isKnownLayer(key)) {
                        hasKnownLayerLabels = true;
                    }
                    layerCounts.merge(key, 1, Integer::sum);
                }

                String suiteName = result.getSuiteName();
                if (StringUtils.isNotBlank(suiteName)) {
                    suiteCounts.merge(suiteName, 1, Integer::sum);
                }

                Long duration = result.getDurationMs();
                if (duration != null && duration >= 0) {
                    durations.add(duration);
                }
            }
        }

        List<SuiteStat> topSuiteStats = suiteCounts.entrySet().stream()
                .sorted(Comparator.<Map.Entry<String, Integer>>comparingInt(Map.Entry::getValue).reversed()
                        .thenComparing(Map.Entry::getKey))
                .limit(Math.max(topSuites, 0))
                .map(entry -> new SuiteStat(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        durations.sort(Long::compareTo);

        int resultCount = results == null ? 0 : results.size();
        warnIfSummaryDivergesFromResults(statistic, resultCount);

        return new ReportAnalytics(
                statistic,
                layerCounts,
                topSuiteStats,
                durations,
                hasLayerLabels,
                hasKnownLayerLabels,
                resultCount);
    }

    private static void warnIfSummaryDivergesFromResults(Statistic statistic, int resultCount) {
        if (statistic == null || statistic.getTotal() == null) {
            return;
        }
        int summaryTotal = statistic.getTotal();
        if (resultCount == 0 && summaryTotal > 0) {
            log.warn("No allure-results loaded while summary.total={}. "
                    + "Collage pyramid/durations may be empty; pie/text still use summary.",
                    summaryTotal);
            return;
        }
        if (resultCount > 0 && summaryTotal != resultCount) {
            log.warn("Summary total ({}) differs from allure-results count ({}). "
                    + "Pie/text use summary; pyramid/durations use results.",
                    summaryTotal, resultCount);
        }
    }
}
