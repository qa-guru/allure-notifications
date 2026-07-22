package guru.qa.allure.notifications.report;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import guru.qa.allure.notifications.model.summary.Statistic;

/**
 * Aggregated analytics for collage charts: summary statistic plus allure-results breakdown.
 */
public final class ReportAnalytics {
    private final Statistic statistic;
    private final Map<String, Integer> layers;
    private final List<SuiteStat> suites;
    private final List<Long> durationsMs;
    private final Map<String, List<Long>> durationsMsByLayer;
    private final Map<String, Integer> severities;
    private final boolean hasLayerLabels;
    private final boolean hasKnownLayerLabels;
    private final int resultCount;
    private HistoryAnalytics history;

    public ReportAnalytics(Statistic statistic,
                             Map<String, Integer> layers,
                             List<SuiteStat> suites,
                             List<Long> durationsMs,
                             boolean hasLayerLabels,
                             int resultCount) {
        this(statistic, layers, suites, durationsMs,
                Collections.<String, List<Long>>emptyMap(),
                Collections.<String, Integer>emptyMap(),
                hasLayerLabels, false, resultCount);
    }

    public ReportAnalytics(Statistic statistic,
                             Map<String, Integer> layers,
                             List<SuiteStat> suites,
                             List<Long> durationsMs,
                             boolean hasLayerLabels,
                             boolean hasKnownLayerLabels,
                             int resultCount) {
        this(statistic, layers, suites, durationsMs,
                Collections.<String, List<Long>>emptyMap(),
                Collections.<String, Integer>emptyMap(),
                hasLayerLabels, hasKnownLayerLabels, resultCount);
    }

    public ReportAnalytics(Statistic statistic,
                             Map<String, Integer> layers,
                             List<SuiteStat> suites,
                             List<Long> durationsMs,
                             Map<String, Integer> severities,
                             boolean hasLayerLabels,
                             boolean hasKnownLayerLabels,
                             int resultCount) {
        this(statistic, layers, suites, durationsMs,
                Collections.<String, List<Long>>emptyMap(),
                severities, hasLayerLabels, hasKnownLayerLabels, resultCount);
    }

    public ReportAnalytics(Statistic statistic,
                             Map<String, Integer> layers,
                             List<SuiteStat> suites,
                             List<Long> durationsMs,
                             Map<String, List<Long>> durationsMsByLayer,
                             Map<String, Integer> severities,
                             boolean hasLayerLabels,
                             boolean hasKnownLayerLabels,
                             int resultCount) {
        this.statistic = statistic;
        this.layers = Collections.unmodifiableMap(layers);
        this.suites = Collections.unmodifiableList(suites);
        this.durationsMs = Collections.unmodifiableList(durationsMs);
        this.durationsMsByLayer = freezeDurationsByLayer(durationsMsByLayer);
        this.severities = Collections.unmodifiableMap(
                severities == null ? Collections.<String, Integer>emptyMap() : severities);
        this.hasLayerLabels = hasLayerLabels;
        this.hasKnownLayerLabels = hasKnownLayerLabels;
        this.resultCount = resultCount;
    }

    private static Map<String, List<Long>> freezeDurationsByLayer(Map<String, List<Long>> raw) {
        if (raw == null || raw.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, List<Long>> copy = new java.util.LinkedHashMap<String, List<Long>>();
        for (Map.Entry<String, List<Long>> entry : raw.entrySet()) {
            List<Long> values = entry.getValue() == null
                    ? Collections.<Long>emptyList()
                    : Collections.unmodifiableList(entry.getValue());
            copy.put(entry.getKey(), values);
        }
        return Collections.unmodifiableMap(copy);
    }

    public Statistic getStatistic() {
        return statistic;
    }

    public Map<String, Integer> getLayers() {
        return layers;
    }

    public List<SuiteStat> getSuites() {
        return suites;
    }

    public List<Long> getDurationsMs() {
        return durationsMs;
    }

    /**
     * Per-layer duration samples (ms) for {@code durations} + {@code groupBy: layer}.
     * Empty when no result has both a layer label and a duration.
     */
    public Map<String, List<Long>> getDurationsMsByLayer() {
        return durationsMsByLayer;
    }

    /**
     * Counts of Allure {@code severity} labels from {@code *-result.json}
     * (blocker / critical / normal / minor / trivial / …). Empty when none present.
     */
    public Map<String, Integer> getSeverities() {
        return severities;
    }

    public boolean hasLayerLabels() {
        return hasLayerLabels;
    }

    public boolean hasKnownLayerLabels() {
        return hasKnownLayerLabels;
    }

    public int getResultCount() {
        return resultCount;
    }

    /**
     * Optional history-derived analytics for the statusDynamics / successRateDistribution
     * panels. {@code null} when no {@code chart.historyPath} is configured.
     */
    public HistoryAnalytics getHistory() {
        return history;
    }

    public void setHistory(HistoryAnalytics history) {
        this.history = history;
    }
}
