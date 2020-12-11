package allure.piechart.telegram.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;


@JsonInclude(JsonInclude.Include.NON_NULL)
public class Summary {

    @JsonProperty("reportName")
    private String reportName;
    @JsonProperty("testRuns")
    private List<Object> testRuns = null;
    @JsonProperty("statistic")
    private Statistic statistic;
    @JsonProperty("time")
    private Time time;

    @JsonProperty("reportName")
    public String getReportName() {
        return reportName;
    }

    @JsonProperty("testRuns")
    public List<Object> getTestRuns() {
        return testRuns;
    }

    @JsonProperty("statistic")
    public Statistic getStatistic() {
        return statistic;
    }

    @JsonProperty("time")
    public Time getTime() {
        return time;
    }
}
