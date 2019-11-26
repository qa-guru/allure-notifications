package piechart.telegram;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static java.lang.Long.parseLong;

public class Utils {

    // parser for data allure-report/export/prometheusData.txt
    public static List<Long> parsedDataForPie(String filePath) {
        List<Long> parsedData = new ArrayList<>();
        String[] data = readStringFromFile(filePath).split("\n");

        parsedData.add(getNumber(data[0]));
        parsedData.add(getNumber(data[1]));
        parsedData.add(getNumber(data[2]));
        parsedData.add(getNumber(data[3]));
        parsedData.add(getNumber(data[4]));

        return parsedData;
    }

    public static Long getNumber(String dataItem) {
        return parseLong(dataItem.split(" ")[1]);
    }

    public static String readStringFromFile(String filePath) {
        try {
            return new String(Files.readAllBytes(Paths.get(filePath)));
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println("File reading error");
        return "File reading error";
    }
}
