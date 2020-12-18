package allure.piechart.telegram.chart;

import allure.piechart.telegram.models.Summary;
import org.knowm.xchart.PieChart;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * Отвечает за создание серии на диаграмме.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class ChartSeries {
    public static List<int[]> createSeries(final @NotNull Summary summary, final @NotNull PieChart chart) {
        long failed = summary.getStatistic().getFailed();
        long broken = summary.getStatistic().getBroken();
        long passed = summary.getStatistic().getPassed();
        long skipped = summary.getStatistic().getSkipped();
        long unknown = summary.getStatistic().getUnknown();

        List<int[]> colors = new ArrayList<>();
        if (passed != 0) {
            chart.addSeries(passed + " passed", passed);
            colors.add(new int[]{148, 202, 102});
        }

        if (failed != 0) {
            chart.addSeries(failed + " failed", failed);
            colors.add(new int[]{255, 87, 68});
        }
        if (skipped != 0) {
            chart.addSeries(skipped + " skipped", skipped);
            colors.add(new int[]{170, 170, 170});
        }
        if (broken != 0) {
            chart.addSeries(broken + " broken", broken);
            colors.add(new int[]{255, 206, 87});
        }
        if (unknown != 0) {
            chart.addSeries(unknown + " unknown", unknown);
            colors.add(new int[]{216, 97,  190});
        }
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        return colors;
    }
}
