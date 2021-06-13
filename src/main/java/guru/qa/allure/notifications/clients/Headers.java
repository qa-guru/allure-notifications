package guru.qa.allure.notifications.clients;

public enum Headers {
    JSON("application/json"),
    URL_ENCODED("application/x-www-form-urlencoded");

    private final String contentType;

    Headers(String contentType) {
        this.contentType = contentType;
    }

    public String header() {
        return contentType;
    }
}
