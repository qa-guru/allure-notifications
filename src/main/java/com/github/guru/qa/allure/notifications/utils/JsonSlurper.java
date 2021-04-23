package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.model.Summary;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.Map;

import static com.google.gson.JsonParser.parseString;

/**
 * Содержит вспомогательные методы для работы с JSON.
 * @author kadehar
 * @since 2.0.10
 */
public class JsonSlurper {
    private static final Logger LOG = LoggerFactory.getLogger(JsonSlurper.class);

    /**
     * Считывает summary.json в модель Summary
     * @param path путь к JSON файлу
     * @return итоговая информация из отчета
     */
    public static Summary readSummaryJson(final String path) {
        Gson gson = new Gson();
        Summary summary = null;
        try {
            summary = gson.fromJson(new FileReader(path), Summary.class);
        } catch (FileNotFoundException ex) {
            LOG.error("Error {} \n Reason {}", ex.getLocalizedMessage(), ex.getStackTrace());
            ex.printStackTrace();
            System.exit(1);
        }
        return summary;
    }

    public static String convertMapToJSON(Map<String, Object> map) {
        Gson gson = new Gson();
        LOG.info("Try to convert {} to JSON", map);
        String json = gson.toJson(map);
        LOG.info("Operation is finished successfully");
        return json;
    }

    public static String prettyPrint(String json) {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        return gson.toJson(parseString(json));
    }
}