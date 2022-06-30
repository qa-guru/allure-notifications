package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.mapper.LegendMapper;
import guru.qa.allure.notifications.mapper.SummaryMapper;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import org.knowm.xchart.PieChart;

import java.util.ArrayList;
import java.util.List;

public class ChartSeries {
    private final List<int[]> colors = new ArrayList<>();
    private final LegendMapper legendMapper;
    private final SummaryMapper summaryMapper;

    public ChartSeries(Base base) {
        this.legendMapper = new LegendMapper(base);
        this.summaryMapper = new SummaryMapper(base);
    }

    public List<int[]> addSeriesTo(PieChart chart) {
        final Summary summary = summaryMapper.map();
        final Legend legend = legendMapper.map();

        final long passed = summary.statistic().passed();
        final long failed = summary.statistic().failed();
        final long broken = summary.statistic().broken();
        final long skipped = summary.statistic().skipped();
        final long unknown = summary.statistic().unknown();

        if (passed != 0) {
            chart.addSeries(String.format("%d %s", passed,
                    legend.passed()), passed);
            colors.add(Color.GREEN.rgb);
        }
        if (failed != 0) {
            chart.addSeries(String.format("%d %s", failed,
                    legend.failed()), failed);
            colors.add(Color.RED.rgb);
        }
        if (broken != 0) {
            chart.addSeries(String.format("%d %s", broken,
                    legend.broken()), broken);
            colors.add(Color.YELLOW.rgb);
        }
        if (skipped != 0) {
            chart.addSeries(String.format("%d %s", skipped,
                    legend.skipped()), skipped);
            colors.add(Color.GRAY.rgb);
        }
        if (unknown != 0) {
            chart.addSeries(String.format("%d %s", unknown,
                    legend.unknown()), unknown);
            colors.add(Color.PURPLE.rgb);
        }

        colors.add(Color.BLACK.rgb);
        colors.add(Color.BLACK.rgb);
        colors.add(Color.BLACK.rgb);
        colors.add(Color.BLACK.rgb);
        colors.add(Color.BLACK.rgb);

        return colors;
    }
}
