package guru.qa.allure.notifications.report;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import guru.qa.allure.notifications.json.JSON;
import lombok.extern.slf4j.Slf4j;

/**
 * Reads Allure {@code *-result.json} files from an allure-results folder.
 */
@Slf4j
public final class AllureResultsReader {
    private static final String RESULT_SUFFIX = "-result.json";
    private static final String DEFAULT_RESULTS_DIR = "allure-results";
    private static final int MAX_WALK_DEPTH = 8;

    private AllureResultsReader() {
    }

    /**
     * Resolve results directory: explicit path, or sibling {@code allure-results} next to the report folder.
     */
    public static Path resolveResultsFolder(String allureResultsFolder, Path allureFolder) {
        if (allureResultsFolder != null && !allureResultsFolder.trim().isEmpty()) {
            return Paths.get(allureResultsFolder.trim()).toAbsolutePath().normalize();
        }
        if (allureFolder == null) {
            return null;
        }
        Path report = allureFolder.toAbsolutePath().normalize();
        Path parent = report.getParent();
        if (parent != null) {
            Path sibling = parent.resolve(DEFAULT_RESULTS_DIR);
            if (Files.isDirectory(sibling)) {
                return sibling;
            }
        }
        Path nested = report.resolve(DEFAULT_RESULTS_DIR);
        if (Files.isDirectory(nested)) {
            return nested;
        }
        return parent != null ? parent.resolve(DEFAULT_RESULTS_DIR) : report.resolve(DEFAULT_RESULTS_DIR);
    }

    public static List<AllureTestResult> read(Path resultsFolder) {
        return read(new JSON(), resultsFolder);
    }

    public static List<AllureTestResult> read(JSON json, Path resultsFolder) {
        if (resultsFolder == null || !Files.isDirectory(resultsFolder)) {
            log.warn("allure-results folder is missing or not a directory: {}", resultsFolder);
            return Collections.emptyList();
        }

        List<Path> resultFiles;
        try (Stream<Path> walk = Files.walk(resultsFolder, MAX_WALK_DEPTH)) {
            resultFiles = walk
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(RESULT_SUFFIX))
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.warn("Failed to scan allure-results at {}: {}", resultsFolder, e.getMessage());
            return Collections.emptyList();
        }

        List<AllureTestResult> results = new ArrayList<AllureTestResult>();
        for (Path file : resultFiles) {
            try {
                AllureTestResult result = json.parseFile(file.toFile(), AllureTestResult.class);
                if (result != null) {
                    results.add(result);
                }
            } catch (Exception e) {
                log.warn("Skipping invalid result file {}: {}", file, e.getMessage());
            }
        }
        log.info("Loaded {} test result(s) from {}", results.size(), resultsFolder);
        return results;
    }
}
