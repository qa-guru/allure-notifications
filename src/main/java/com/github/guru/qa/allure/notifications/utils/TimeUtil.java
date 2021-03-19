package com.github.guru.qa.allure.notifications.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

/**
 * Содержит вспомогательные методы для работы с датой и временем.
 * @author kadehar
 * @since 2.0.10
 */
public class TimeUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(TimeUtil.class);

    /**
     * Форматирует время по заданному формату
     * @param ms время в миллисекундах
     * @return время в формате HH:mm:ss.SSS
     */
    public static String time(final Long ms) {
        LOGGER.info("Time(ms): {}", ms);
        Date date = new Date(ms);
        DateFormat formatter = new SimpleDateFormat("HH:mm:ss.SSS");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        String time = formatter.format(date);
        LOGGER.info("Formatted time: {}", time);
        return time;
    }
}
