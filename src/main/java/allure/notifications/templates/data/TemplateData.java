package allure.notifications.templates.data;

/**
 * Содержит в себе данные для отображения в шаблоне
 *
 * @author kadehar
 * @since 2.0.2
 */
public class TemplateData {
    private final long failed;
    private final long broken;
    private final long passed;
    private final long unknown;
    private final long skipped;
    private final long total;
    private final long duration;
    private final long percentOfFailed;
    private final long percentOfPassed;
    private final String launchName;
    private final String environment;
    private final String reportLink;

    private TemplateData(Builder builder) {
        failed = builder.failed;
        broken = builder.broken;
        passed = builder.passed;
        unknown = builder.unknown;
        skipped = builder.skipped;
        total = builder.total;
        duration = builder.duration;
        launchName = builder.launchName;
        environment = builder.environment;
        reportLink = builder.reportLink;
        percentOfFailed = failed * 100 / total;
        percentOfPassed = passed * 100 / total;
    }

    public static class Builder {
        private long failed;
        private long broken;
        private long passed;
        private long unknown;
        private long skipped;
        private long total;
        private long duration;
        private String launchName;
        private String environment;
        private String reportLink;

        public Builder failed(final long failed) {
            this.failed = failed;
            return this;
        }

        public Builder broken(final long broken) {
            this.broken = broken;
            return this;
        }

        public Builder passed(final long passed) {
            this.passed = passed;
            return this;
        }

        public Builder unknown(final long unknown) {
            this.unknown = unknown;
            return this;
        }

        public Builder skipped(final long skipped) {
            this.skipped = skipped;
            return this;
        }

        public Builder total(final long total) {
            this.total = total;
            return this;
        }

        public Builder duration(final long duration) {
            this.duration = duration;
            return this;
        }

        public Builder launch(final String launchName) {
            this.launchName = launchName;
            return this;
        }

        public Builder environment(final String environment) {
            this.environment = environment;
            return this;
        }

        public Builder reportLink(final String reportLink) {
            this.reportLink = reportLink;
            return this;
        }

        public TemplateData build() {
            return new TemplateData(this);
        }
    }

    public long getFailed() {
        return failed;
    }

    public long getBroken() {
        return broken;
    }

    public long getPassed() {
        return passed;
    }

    public long getUnknown() {
        return unknown;
    }

    public long getSkipped() {
        return skipped;
    }

    public long getTotal() {
        return total;
    }

    public long getDuration() {
        return duration;
    }

    public long getPercentOfFailed() {
        return percentOfFailed;
    }

    public long getPercentOfPassed() {
        return percentOfPassed;
    }

    public String getLaunchName() {
        return launchName;
    }

    public String getEnvironment() {
        return environment;
    }

    public String getReportLink() {
        return reportLink;
    }
}
