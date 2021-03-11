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
    private final String proxyHost;
    private final int proxyPort;
    private final String proxyLogin;
    private final String proxyPassword;

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
        proxyHost = builder.proxyHost;
        proxyPort = builder.proxyPort;
        proxyLogin = builder.proxyLogin;
        proxyPassword = builder.proxyPassword;
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
        private String proxyHost;
        private int proxyPort;
        private String proxyLogin;
        private String proxyPassword;

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

        public Builder proxyHost(String proxyHost) {
            this.proxyHost = proxyHost;
            return this;
        }

        public Builder proxyPort(int proxyPort) {
            this.proxyPort = proxyPort;
            return this;
        }

        public Builder proxyLogin(String proxyLogin) {
            this.proxyLogin = proxyLogin;
            return this;
        }

        public Builder proxyPassword(String proxyPassword) {
            this.proxyPassword = proxyPassword;
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

    public String getProxyHost() {
        return proxyHost;
    }

    public int getProxyPort() {
        return proxyPort;
    }

    public String getProxyLogin() {
        return proxyLogin;
    }

    public String getProxyPassword() {
        return proxyPassword;
    }

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
                "\n\tproxyHost: " + proxyHost +
                "\n\tproxyPort: " + proxyPort +
                "\n}";
    }
}
