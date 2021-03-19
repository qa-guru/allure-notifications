package com.github.guru.qa.allure.notifications.utils;

import static java.nio.charset.StandardCharsets.UTF_8;

public class StringUtils {
    public static String convertToUTF8(String text) {
        byte[] bytes = text.getBytes(UTF_8);
        return new String(bytes, UTF_8);
    }
}
