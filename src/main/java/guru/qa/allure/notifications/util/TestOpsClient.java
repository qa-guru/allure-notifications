package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.testops.TestOps;
import kong.unirest.Unirest;
import kong.unirest.json.JSONArray;
import kong.unirest.json.JSONObject;

import java.util.HashMap;

public class TestOpsClient {

    public static TestOps testops;

    public TestOpsClient(TestOps testOps) {
        this.testops = testOps;
    }

    public static String getLastLaunchId() {
        String url = String.format("%s/api/rs/launch?projectId=%s&page=0&size=10&sort=created_date,DESC",
                testops.getUrl(),
                testops.getProjectId());

        String jsonString = Unirest.get(url)
                .header("Authorization", testops.getAuth_token())
                .header("XSRF-TOKEN", testops.getXsrf_token())
                .header("accept", "*/*")
                .asString()
                .getBody();
        JSONObject jsonObject = new JSONObject(jsonString);
        JSONArray jsonArray = jsonObject.getJSONArray("content");
        String launchId = jsonArray.getJSONObject(0).getString("id");
        return launchId;
    }

    public static HashMap getLaunchStatistic() {
        String launchId = getLastLaunchId();
        return getLaunchStatistic(launchId);
    }
    public static HashMap getLaunchStatistic(String launchId) {
        String url = String.format("%s/api/rs/launch/%s/statistic", testops.getUrl(), launchId);

        String jsonString = Unirest.get(url)
                .header("Authorization", testops.getAuth_token())
                .header("XSRF-TOKEN", testops.getXsrf_token())
                .header("accept", "*/*")
                .asString()
                .getBody();
        JSONArray jsonArray = new JSONArray(jsonString);
        HashMap<String, Integer> statistics = new HashMap<>();
        Integer total = 0;
        for (int i = 0; i < jsonArray.length(); i++) {
            JSONObject element = jsonArray.getJSONObject(i);
            String status = element.getString("status");
            Integer count = element.getInt("count");
            statistics.put(status, count);
            total = total + count;
        }
        statistics.put("total", total);
        return statistics;
    }
}
