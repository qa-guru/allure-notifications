package guru.qa.allure.notifications.report;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import lombok.extern.slf4j.Slf4j;

/**
 * Locates Allure 2 / Allure 3 report artifacts under a configured folder.
 */
@Slf4j
public final class ReportLocator {
    private static final String SUMMARY_FILE = "summary.json";
    private static final String WIDGETS_SUMMARY = "widgets/summary.json";
    private static final String WIDGETS_SUITES = "widgets/suites.json";
    private static final String DASHBOARD_DIR = "dashboard";
    private static final String SIBLING_DASHBOARD = "allure-dashboard";
    private static final int MAX_WALK_DEPTH = 5;

    private ReportLocator() {
    }

    public static LocatedReport locate(Path allureFolder) throws ReportNotFoundException {
        if (allureFolder == null) {
            throw new ReportNotFoundException("allureFolder is null");
        }
        Path folder = allureFolder.toAbsolutePath().normalize();
        if (!Files.isDirectory(folder)) {
            throw new ReportNotFoundException("Allure folder does not exist or is not a directory: " + folder);
        }

        Path widgetsSummary = folder.resolve(WIDGETS_SUMMARY);
        if (Files.isRegularFile(widgetsSummary)) {
            return buildLocated(folder, widgetsSummary, AllureReportVersion.ALLURE_2);
        }

        Path rootSummary = folder.resolve(SUMMARY_FILE);
        if (Files.isRegularFile(rootSummary)) {
            AllureReportVersion version = detectVersion(rootSummary);
            return buildLocated(folder, rootSummary, version);
        }

        Path found = findSummaryRecursively(folder);
        Path reportRoot = resolveReportRoot(found);
        AllureReportVersion version = detectVersion(found);
        return buildLocated(reportRoot, found, version);
    }

    private static LocatedReport buildLocated(Path reportRoot, Path summaryPath, AllureReportVersion version) {
        Path suitesPath = null;
        Path suitesCandidate = reportRoot.resolve(WIDGETS_SUITES);
        if (Files.isRegularFile(suitesCandidate)) {
            suitesPath = suitesCandidate;
        }
        Path dashboardPath = resolveDashboard(reportRoot).orElse(null);
        if (dashboardPath != null) {
            log.debug("Resolved dashboard at {}", dashboardPath);
        }
        log.info("Located Allure {} report: summary={}", version, summaryPath);
        return new LocatedReport(reportRoot, summaryPath, version, suitesPath, dashboardPath);
    }

    static AllureReportVersion detectVersion(Path summaryPath) throws ReportNotFoundException {
        try (Reader reader = Files.newBufferedReader(summaryPath, StandardCharsets.UTF_8)) {
            JsonObject root = JsonParser.parseReader(reader).getAsJsonObject();
            if (root.has("statistic")) {
                return AllureReportVersion.ALLURE_2;
            }
            if (root.has("stats")) {
                return AllureReportVersion.ALLURE_3;
            }
            // widgets/summary.json without peek already mapped to A2; root summary without known keys → A2 fallback
            if (summaryPath.toString().replace('\\', '/').contains("/widgets/")) {
                return AllureReportVersion.ALLURE_2;
            }
            throw new ReportNotFoundException(
                    "Unable to detect Allure version from summary (no statistic/stats): " + summaryPath);
        } catch (ReportNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ReportNotFoundException("Unable to read summary.json: " + summaryPath, e);
        }
    }

    private static Path findSummaryRecursively(Path folder) throws ReportNotFoundException {
        List<Path> candidates = new ArrayList<Path>();
        try (Stream<Path> walk = Files.walk(folder, MAX_WALK_DEPTH, FileVisitOption.FOLLOW_LINKS)) {
            candidates = walk
                    .filter(Files::isRegularFile)
                    .filter(p -> SUMMARY_FILE.equals(p.getFileName().toString()))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new ReportNotFoundException("Failed to scan for summary.json under " + folder, e);
        }
        if (candidates.isEmpty()) {
            throw new ReportNotFoundException(
                    "summary.json not found under " + folder
                            + " (checked widgets/summary.json, summary.json, recursive depth "
                            + MAX_WALK_DEPTH + ")");
        }
        Collections.sort(candidates, Comparator
                .comparingInt((Path p) -> depthRelative(folder, p))
                .thenComparing((Path p) -> p.toString().replace('\\', '/').contains("/widgets/") ? 0 : 1)
                .thenComparing(Path::toString));
        return candidates.get(0);
    }

    private static int depthRelative(Path root, Path file) {
        Path relative = root.relativize(file.toAbsolutePath().normalize());
        return relative.getNameCount();
    }

    static Path resolveReportRoot(Path summaryPath) {
        Path parent = summaryPath.getParent();
        if (parent != null && "widgets".equals(parent.getFileName().toString())) {
            Path reportRoot = parent.getParent();
            return reportRoot != null ? reportRoot : parent;
        }
        return parent;
    }

    static java.util.Optional<Path> resolveDashboard(Path reportRoot) {
        Path nested = reportRoot.resolve(DASHBOARD_DIR);
        if (isDashboardDir(nested)) {
            return java.util.Optional.of(nested);
        }
        Path parent = reportRoot.getParent();
        if (parent != null) {
            Path sibling = parent.resolve(SIBLING_DASHBOARD);
            if (isDashboardDir(sibling)) {
                return java.util.Optional.of(sibling);
            }
        }
        return java.util.Optional.empty();
    }

    private static boolean isDashboardDir(Path dir) {
        if (!Files.isDirectory(dir)) {
            return false;
        }
        return Files.isRegularFile(dir.resolve("index.html"))
                || Files.isRegularFile(dir.resolve(SUMMARY_FILE));
    }
}
