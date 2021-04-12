package com.github.guru.qa.allure.notifications.client.clients.interceptors.enums;

public enum Header {
    JSON("application/json"),
    URL_ENCODED("application/x-www-form-urlencoded");

    private final String contentType;
    Header(String contentType) {
        this.contentType = contentType;
    }

    public String contentType() {
        return contentType;
    }
}
