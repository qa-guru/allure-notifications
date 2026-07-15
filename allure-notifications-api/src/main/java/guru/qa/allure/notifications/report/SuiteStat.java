package guru.qa.allure.notifications.report;

/**
 * Aggregated test count for a suite (used in suites fallback chart).
 */
public final class SuiteStat {
    private final String name;
    private final int count;

    public SuiteStat(String name, int count) {
        this.name = name;
        this.count = count;
    }

    public String getName() {
        return name;
    }

    public int getCount() {
        return count;
    }
}
