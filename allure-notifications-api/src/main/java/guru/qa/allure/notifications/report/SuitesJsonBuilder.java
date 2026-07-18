package guru.qa.allure.notifications.report;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.apache.commons.lang3.StringUtils;

/**
 * Builds Allure 2 {@code widgets/suites.json}-compatible JSON from raw results
 * (used when Allure 3 reports have no widgets/suites.json).
 */
public final class SuitesJsonBuilder {
    private static final Gson GSON = new GsonBuilder().create();
    private static final int DEFAULT_TOP_SUITES = 10;

    private SuitesJsonBuilder() {
    }

    public static String fromResults(List<AllureTestResult> results) {
        return fromResults(results, DEFAULT_TOP_SUITES);
    }

    public static String fromResults(List<AllureTestResult> results, int topSuites) {
        if (results == null || results.isEmpty()) {
            return "{\"total\":0,\"items\":[]}";
        }

        Map<String, SuiteAccumulator> bySuite = new LinkedHashMap<String, SuiteAccumulator>();
        for (AllureTestResult result : results) {
            String suiteName = result.getSuiteName();
            if (StringUtils.isBlank(suiteName)) {
                suiteName = "unknown";
            }
            SuiteAccumulator acc = bySuite.get(suiteName);
            if (acc == null) {
                acc = new SuiteAccumulator(suiteName);
                bySuite.put(suiteName, acc);
            }
            acc.add(result.getStatus());
        }

        List<SuiteAccumulator> ranked = new ArrayList<SuiteAccumulator>(bySuite.values());
        ranked.sort((a, b) -> {
            int byTotal = Integer.compare(b.total, a.total);
            if (byTotal != 0) {
                return byTotal;
            }
            return a.name.compareTo(b.name);
        });

        int limit = Math.max(topSuites, 0);
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        int end = Math.min(limit, ranked.size());
        for (int i = 0; i < end; i++) {
            items.add(ranked.get(i).toItem());
        }

        Map<String, Object> root = new LinkedHashMap<String, Object>();
        root.put("total", bySuite.size());
        root.put("items", items);
        return GSON.toJson(root);
    }

    private static final class SuiteAccumulator {
        private final String name;
        private int failed;
        private int broken;
        private int skipped;
        private int passed;
        private int unknown;
        private int total;

        private SuiteAccumulator(String name) {
            this.name = name;
        }

        private void add(String status) {
            total++;
            String normalized = status == null ? "unknown" : status.trim().toLowerCase(Locale.ROOT);
            if ("passed".equals(normalized)) {
                passed++;
            } else if ("failed".equals(normalized)) {
                failed++;
            } else if ("broken".equals(normalized)) {
                broken++;
            } else if ("skipped".equals(normalized)) {
                skipped++;
            } else {
                unknown++;
            }
        }

        private Map<String, Object> toItem() {
            Map<String, Object> statistic = new LinkedHashMap<String, Object>();
            statistic.put("failed", failed);
            statistic.put("broken", broken);
            statistic.put("skipped", skipped);
            statistic.put("passed", passed);
            statistic.put("unknown", unknown);
            statistic.put("total", total);

            Map<String, Object> item = new LinkedHashMap<String, Object>();
            item.put("uid", UUID.nameUUIDFromBytes(name.getBytes()).toString().replace("-", ""));
            item.put("name", name);
            item.put("statistic", statistic);
            return item;
        }
    }
}
