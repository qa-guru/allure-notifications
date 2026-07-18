package guru.qa.allure.notifications.report;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import com.google.gson.Gson;

import lombok.extern.slf4j.Slf4j;

/**
 * Reads an Allure 3 {@code history.jsonl} (one JSON object per line, one line per run).
 */
@Slf4j
public final class HistoryReader {
    private static final Gson GSON = new Gson();

    private HistoryReader() {
    }

    /**
     * Reads the history file and returns at most {@code limit} most recent runs,
     * sorted oldest-to-newest by {@code timestamp}. Missing/invalid files yield an
     * empty list; invalid lines are skipped.
     */
    public static List<HistoryRun> read(Path historyFile, int limit) {
        if (historyFile == null || !Files.isRegularFile(historyFile)) {
            log.warn("history file is missing or not a regular file: {}", historyFile);
            return Collections.emptyList();
        }

        List<HistoryRun> runs = new ArrayList<HistoryRun>();
        try (Stream<String> lines = Files.lines(historyFile, StandardCharsets.UTF_8)) {
            lines.forEach(line -> {
                String trimmed = line.trim();
                if (trimmed.isEmpty()) {
                    return;
                }
                try {
                    HistoryRun run = GSON.fromJson(trimmed, HistoryRun.class);
                    if (run != null) {
                        runs.add(run);
                    }
                } catch (Exception e) {
                    log.warn("Skipping invalid history line: {}", e.getMessage());
                }
            });
        } catch (IOException e) {
            log.warn("Failed to read history file {}: {}", historyFile, e.getMessage());
            return Collections.emptyList();
        }

        runs.sort(Comparator.comparingLong(run -> run.getTimestamp() == null ? 0L : run.getTimestamp()));
        if (limit > 0 && runs.size() > limit) {
            return new ArrayList<HistoryRun>(runs.subList(runs.size() - limit, runs.size()));
        }
        log.info("Loaded {} history run(s) from {}", runs.size(), historyFile);
        return runs;
    }
}
