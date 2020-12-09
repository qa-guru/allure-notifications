package allure.piechart.telegram.bot.factory;

import allure.piechart.telegram.bot.PieChartBot;
import allure.piechart.telegram.bot.TextBot;

public class BotFactory {
    public static TextBot createTextBot(final String token) {
        return new TextBot(token);
    }

    public static PieChartBot createPieChartBot(final String token) {
        return new PieChartBot(token);
    }
}
