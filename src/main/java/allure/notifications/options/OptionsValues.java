package allure.notifications.options;

/**
 * Контейнер для хранения значений, переданных из аргументов командной строки.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class OptionsValues {
    private final boolean chart;
    private final String token;
    private final String chatId;
    private final String projectName;
    private final String allureReportFolder;
    private final String buildLink;
    private final String launchName;
    private final String env;
    private final String language;
    private final String messenger;
    private final String mattermostUrl;

    private OptionsValues(Builder builder) {
        chart = builder.chart;
        token = builder.token;
        chatId = builder.chatId;
        projectName = builder.projectName;
        allureReportFolder = builder.allureReportFolder;
        buildLink = builder.buildLink;
        launchName = builder.launchName;
        env = builder.env;
        language = builder.language;
        messenger = builder.messenger;
        mattermostUrl = builder.mattermostUrl;
    }

    public static class Builder {
        private boolean chart;
        private String token;
        private String chatId;
        private String projectName;
        private String allureReportFolder;
        private String buildLink;
        private String launchName;
        private String env;
        private String language;
        private String messenger;
        private String mattermostUrl;

        public Builder enableChart(boolean flag) {
            chart = flag;
            return this;
        }

        public Builder botToken(String token) {
            this.token = token;
            return this;
        }

        public Builder chatId(String id) {
            chatId = id;
            return this;
        }

        public Builder project(String name) {
            projectName = name;
            return this;
        }

        public Builder reportFolder(String folder) {
            allureReportFolder = folder;
            return this;
        }

        public Builder buildLink(String link) {
            buildLink = link;
            return this;
        }

        public Builder launch(String name) {
            launchName = name;
            return this;
        }

        public Builder environment(String env) {
            this.env = env;
            return this;
        }

        public Builder language(String language) {
            this.language = language;
            return this;
        }

        public Builder messenger(String messenger) {
            this.messenger = messenger;
            return this;
        }

        public Builder mattermostUrl(String mattermostUrl) {
            this.mattermostUrl = mattermostUrl;
            return this;
        }

        public OptionsValues build() {
            return new OptionsValues(this);
        }
    }

    public boolean isChart() {
        return chart;
    }

    public String getToken() {
        return token;
    }

    public String getChatId() {
        return chatId;
    }

    public String getProjectName() {
        return projectName;
    }

    public String getAllureReportFolder() {
        return allureReportFolder;
    }

    public String getBuildLink() {
        return buildLink;
    }

    public String getLaunchName() {
        return launchName;
    }

    public String getEnv() {
        return env;
    }

    public String getLanguage() {
        return language;
    }

    public String getMessenger() {
        return messenger;
    }

    public String getMattermostUrl() { return mattermostUrl; }

    @Override
    public String toString() {
        return "\n{" + "\n\tchart: " + chart +
                ",\n\ttoken: " + token +
                ",\n\tchat_id: " + chatId +
                ",\n\tproject_name: " + projectName +
                ",\n\tallure_report_folder: " + allureReportFolder +
                ",\n\tbuild_link: " + buildLink +
                ",\n\tlaunch_name: " + launchName +
                ",\n\tenvironment: " + env +
                ",\n\tlanguage: " + language +
                "\n\tmessenger: " + messenger +
                "\n\tmattermost_url: " + mattermostUrl +
                "\n}";
    }
}
