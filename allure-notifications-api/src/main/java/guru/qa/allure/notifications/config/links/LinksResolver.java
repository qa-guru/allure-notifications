package guru.qa.allure.notifications.config.links;

import java.util.LinkedHashMap;
import java.util.Map;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.formatters.Formatters;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;

/**
 * Resolves effective notification links from {@link Base#links} and deprecated {@link Base#reportLink}.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class LinksResolver {
    private static final String KEY_REPORT = "report";
    private static final String KEY_DASHBOARD = "dashboard";
    private static final String KEY_TESTOPS = "testops";
    private static final String KEY_BUILD = "build";

    public static Map<String, String> resolve(Base base) {
        LinkedHashMap<String, String> resolved = new LinkedHashMap<String, String>();
        Links links = base.getLinks();

        String report = firstNonBlank(links != null ? links.getReport() : null, base.getReportLink());
        putIfNotBlank(resolved, KEY_REPORT, Formatters.formatReportLink(report));

        if (links != null) {
            putIfNotBlank(resolved, KEY_DASHBOARD, links.getDashboard());
            putIfNotBlank(resolved, KEY_TESTOPS, links.getTestops());
            putIfNotBlank(resolved, KEY_BUILD, links.getBuild());
        }

        return resolved;
    }

    private static void putIfNotBlank(Map<String, String> target, String key, String value) {
        if (StringUtils.isNotBlank(value)) {
            target.put(key, value.trim());
        }
    }

    private static String firstNonBlank(String primary, String fallback) {
        if (StringUtils.isNotBlank(primary)) {
            return primary.trim();
        }
        if (StringUtils.isNotBlank(fallback)) {
            return fallback.trim();
        }
        return null;
    }
}
