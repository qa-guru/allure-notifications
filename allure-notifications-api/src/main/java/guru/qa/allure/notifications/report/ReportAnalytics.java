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
    private final boolean hasLayerLabels;
    private final int resultCount;

    public ReportAnalytics(Statistic statistic,
                             Map<String, Integer> layers,
                             List<SuiteStat> suites,
                             List<Long> durationsMs,
                             boolean hasLayerLabels,
                             int resultCount) {
        this.statistic = statistic;
        this.layers = Collections.unmodifiableMap(layers);
        this.suites = Collections.unmodifiableList(suites);
        this.durationsMs = Collections.unmodifiableList(durationsMs);
        this.hasLayerLabels = hasLayerLabels;
        this.resultCount = resultCount;
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

    public boolean hasLayerLabels() {
        return hasLayerLabels;
    }

    public int getResultCount() {
        return resultCount;
    }
}
