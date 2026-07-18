package guru.qa.allure.notifications.report;

import java.nio.file.Files;
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
import guru.qa.allure.notifications.config.chart.ChartConfig;
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
    static final int DEFAULT_HISTORY_LIMIT = 20;
    /** Allure 3 history file name, auto-discovered next to the report/results. */
    static final String DEFAULT_HISTORY_FILE = "history.jsonl";

    private ReportAnalyticsBuilder() {
    }

    private static void attachHistory(ReportAnalytics analytics, Base base) {
        Path historyFile = resolveHistoryFile(base);
        if (historyFile == null) {
            return;
        }
        ChartConfig chart = base.getChart();
        int limit = chart != null && chart.getHistoryLimit() != null
                ? chart.getHistoryLimit()
                : DEFAULT_HISTORY_LIMIT;
        analytics.setHistory(HistoryAnalytics.from(HistoryReader.read(historyFile, limit)));
    }

    /**
     * Resolve the history file feeding the statusDynamics / successRateDistribution panels.
     *
     * <p>When {@code chart.historyPath} is set it wins (absolute as-is, otherwise relative to
     * the working directory, then to the allure report folder and its parent). When it is
     * <em>not</em> set we auto-discover a {@value #DEFAULT_HISTORY_FILE} next to the report and
     * results folders — mirroring how {@link AllureResultsReader#resolveResultsFolder} finds the
     * sibling {@code allure-results} — so the history panels fill automatically, just like the
     * pie/pyramid panels do. Returns {@code null} when nothing is found.
     */
    private static Path resolveHistoryFile(Base base) {
        if (base == null) {
            return null;
        }
        ChartConfig chart = base.getChart();
        String configured = chart != null ? chart.getHistoryPath() : null;
        if (configured != null && !configured.trim().isEmpty()) {
            return resolveConfiguredHistoryFile(base, configured.trim());
        }
        return autoDiscoverHistoryFile(base);
    }

    private static Path resolveConfiguredHistoryFile(Base base, String configuredPath) {
        Path configured = Paths.get(configuredPath);
        if (configured.isAbsolute()) {
            return configured;
        }
        Path fromCwd = configured.toAbsolutePath().normalize();
        if (Files.isRegularFile(fromCwd)) {
            return fromCwd;
        }
        if (base.getAllureFolder() != null) {
            Path report = Paths.get(base.getAllureFolder()).toAbsolutePath().normalize();
            Path candidate = report.resolve(configured).normalize();
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
            Path parent = report.getParent();
            if (parent != null) {
                Path parentCandidate = parent.resolve(configured).normalize();
                if (Files.isRegularFile(parentCandidate)) {
                    return parentCandidate;
                }
            }
        }
        return fromCwd;
    }

    /**
     * Look for a {@value #DEFAULT_HISTORY_FILE} in the report folder and the results folder
     * (and each of their parents), then the working directory. First match wins.
     */
    private static Path autoDiscoverHistoryFile(Base base) {
        List<Path> dirs = new ArrayList<Path>();
        Path report = null;
        if (StringUtils.isNotBlank(base.getAllureFolder())) {
            report = Paths.get(base.getAllureFolder()).toAbsolutePath().normalize();
            addDirAndParent(dirs, report);
        }
        Path results = AllureResultsReader.resolveResultsFolder(base.getAllureResultsFolder(), report);
        if (results != null) {
            addDirAndParent(dirs, results);
        }
        addDirAndParent(dirs, Paths.get("").toAbsolutePath().normalize());

        for (Path dir : dirs) {
            Path candidate = dir.resolve(DEFAULT_HISTORY_FILE);
            if (Files.isRegularFile(candidate)) {
                log.info("Auto-discovered history file: {}", candidate);
                return candidate;
            }
        }
        log.info("No {} found near report/results; history panels will be empty.", DEFAULT_HISTORY_FILE);
        return null;
    }

    private static void addDirAndParent(List<Path> dirs, Path dir) {
        if (dir == null) {
            return;
        }
        if (!dirs.contains(dir)) {
            dirs.add(dir);
        }
        Path parent = dir.getParent();
        if (parent != null && !dirs.contains(parent)) {
            dirs.add(parent);
        }
    }

    public static ReportAnalytics build(Base base, Summary summary) {
        Path allureFolder = Paths.get(base.getAllureFolder());
        Path resultsFolder = AllureResultsReader.resolveResultsFolder(base.getAllureResultsFolder(), allureFolder);
        List<AllureTestResult> results = AllureResultsReader.read(new JSON(), resultsFolder);
        ReportAnalytics analytics = build(summary, results);
        attachHistory(analytics, base);
        return analytics;
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
