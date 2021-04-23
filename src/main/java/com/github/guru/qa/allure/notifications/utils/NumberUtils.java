package com.github.guru.qa.allure.notifications.utils;

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;

public class NumberUtils {
    public static double formatDoubleValue(double value) {
        DecimalFormat df = new DecimalFormat("##.#");
        String tmp = df.format(value);
        NumberFormat numberFormat = NumberFormat.getInstance();
        try {
            return numberFormat.parse(tmp).doubleValue();
        } catch (ParseException e) {
            return 0.0;
        }
    }

    public static double percentage(int result, int total) {
        double value = (result * 100.00) / total;
        return formatDoubleValue(value);
    }
}
