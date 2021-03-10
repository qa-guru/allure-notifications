package allure.notifications.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Summary {
    private String reportName;
    private List<Object> testRuns;
    private Statistic statistic;
    private Time time;

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public List<Object> getTestRuns() {
        return testRuns;
    }

    public void setTestRuns(List<Object> testRuns) {
        this.testRuns = testRuns;
    }

    public Statistic getStatistic() {
        return statistic;
    }

    public void setStatistic(Statistic statistic) {
        this.statistic = statistic;
    }

    public Time getTime() {
        return time;
    }

    public void setTime(Time time) {
        this.time = time;
    }
}