package guru.qa.allure.notifications.report;

import java.nio.file.Path;
import java.util.Optional;

/**
 * Resolved Allure report locations after auto-detection.
 */
public final class LocatedReport {
    private final Path reportRoot;
    private final Path summaryPath;
    private final AllureReportVersion version;
    private final Path suitesPath;
    private final Path dashboardPath;

    public LocatedReport(Path reportRoot,
                         Path summaryPath,
                         AllureReportVersion version,
                         Path suitesPath,
                         Path dashboardPath) {
        this.reportRoot = reportRoot;
        this.summaryPath = summaryPath;
        this.version = version;
        this.suitesPath = suitesPath;
        this.dashboardPath = dashboardPath;
    }

    public Path getReportRoot() {
        return reportRoot;
    }

    public Path getSummaryPath() {
        return summaryPath;
    }

    public AllureReportVersion getVersion() {
        return version;
    }

    public Optional<Path> getSuitesPath() {
        return Optional.ofNullable(suitesPath);
    }

    public Optional<Path> getDashboardPath() {
        return Optional.ofNullable(dashboardPath);
    }
}
