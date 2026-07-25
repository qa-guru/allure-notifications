package guru.qa.allure.notifications.report;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * History-derived series for the collage history panels:
 * <ul>
 *   <li>{@code statusDynamics} — per-run status counts (passed/failed/broken/skipped/unknown),
 *       ordered oldest-to-newest;</li>
 *   <li>{@code successRateDistribution} — per-test-case pass ratio across the history,
 *       bucketed into {@link #SUCCESS_BUCKETS} equal bins (0-10% … 90-100%).</li>
 * </ul>
 */
public final class HistoryAnalytics {
    /** Ordered status keys shared by the history panels (bottom-to-top in stacked bars). */
    public static final List<String> STATUS_KEYS =
            Arrays.asList("passed", "failed", "broken", "skipped", "unknown");
    public static final int SUCCESS_BUCKETS = 10;

    private final List<Map<String, Integer>> statusDynamics;
    private final int[] successRateDistribution;
    private final int runCount;

    private HistoryAnalytics(List<Map<String, Integer>> statusDynamics,
                             int[] successRateDistribution,
                             int runCount) {
        this.statusDynamics = statusDynamics;
        this.successRateDistribution = successRateDistribution;
        this.runCount = runCount;
    }

    public List<Map<String, Integer>> getStatusDynamics() {
        return statusDynamics;
    }

    public int[] getSuccessRateDistribution() {
        return successRateDistribution;
    }

    public int getRunCount() {
        return runCount;
    }

    public boolean isEmpty() {
        return runCount == 0;
    }

    /** Fixed bucket snapshot for chart layout tests (no synthetic runs). */
    public static HistoryAnalytics withBuckets(int[] successRateDistribution) {
        return new HistoryAnalytics(new ArrayList<Map<String, Integer>>(), successRateDistribution, 1);
    }

    public static HistoryAnalytics from(List<HistoryRun> runs) {
        List<Map<String, Integer>> dynamics = new ArrayList<Map<String, Integer>>();
        // per-testcase tally: [passedRuns, totalRuns]
        Map<String, int[]> perCase = new LinkedHashMap<String, int[]>();

        if (runs != null) {
            for (HistoryRun run : runs) {
                Map<String, Integer> counts = new LinkedHashMap<String, Integer>();
                for (String key : STATUS_KEYS) {
                    counts.put(key, 0);
                }
                for (Map.Entry<String, HistoryTestResult> entry : run.getTestResults().entrySet()) {
                    HistoryTestResult result = entry.getValue();
                    if (result == null) {
                        continue;
                    }
                    String status = result.getStatus() == null
                            ? "unknown"
                            : result.getStatus().trim().toLowerCase(Locale.ROOT);
                    if (!counts.containsKey(status)) {
                        status = "unknown";
                    }
                    counts.merge(status, 1, Integer::sum);

                    String caseId = result.getId() != null ? result.getId() : entry.getKey();
                    int[] tally = perCase.computeIfAbsent(caseId, k -> new int[2]);
                    tally[1]++;
                    if ("passed".equals(status)) {
                        tally[0]++;
                    }
                }
                dynamics.add(counts);
            }
        }

        int[] buckets = new int[SUCCESS_BUCKETS];
        for (int[] tally : perCase.values()) {
            if (tally[1] == 0) {
                continue;
            }
            double rate = (double) tally[0] / tally[1];
            int index = (int) Math.floor(rate * SUCCESS_BUCKETS);
            if (index >= SUCCESS_BUCKETS) {
                index = SUCCESS_BUCKETS - 1;
            }
            if (index < 0) {
                index = 0;
            }
            buckets[index]++;
        }

        return new HistoryAnalytics(dynamics, buckets, dynamics.size());
    }
}
