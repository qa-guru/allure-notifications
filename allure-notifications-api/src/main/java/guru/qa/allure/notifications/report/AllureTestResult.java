package guru.qa.allure.notifications.report;

import java.util.Collections;
import java.util.List;

import com.google.gson.annotations.SerializedName;
import lombok.AccessLevel;
import lombok.Getter;

/**
 * Minimal model of Allure {@code {uuid}-result.json}.
 */
@Getter
public class AllureTestResult {
    @SerializedName("uuid")
    private String uuid;

    @SerializedName("name")
    private String name;

    @SerializedName("fullName")
    private String fullName;

    @SerializedName("status")
    private String status;

    @SerializedName("start")
    private Long start;

    @SerializedName("stop")
    private Long stop;

    @Getter(AccessLevel.NONE)
    @SerializedName("labels")
    private List<AllureLabel> labels;

    public String getLabel(String labelName) {
        if (labels == null || labelName == null) {
            return null;
        }
        for (AllureLabel label : labels) {
            if (labelName.equals(label.getName())) {
                return label.getValue();
            }
        }
        return null;
    }

    public String getLayer() {
        return getLabel("layer");
    }

    /**
     * Suite display name: parentSuite &gt; suite &gt; subSuite &gt; fullName &gt; name.
     */
    public String getSuiteName() {
        String parentSuite = getLabel("parentSuite");
        if (parentSuite != null && !parentSuite.isEmpty()) {
            return parentSuite;
        }
        String suite = getLabel("suite");
        if (suite != null && !suite.isEmpty()) {
            return suite;
        }
        String subSuite = getLabel("subSuite");
        if (subSuite != null && !subSuite.isEmpty()) {
            return subSuite;
        }
        if (fullName != null && !fullName.isEmpty()) {
            return fullName;
        }
        return name;
    }

    public Long getDurationMs() {
        if (start == null || stop == null) {
            return null;
        }
        return stop - start;
    }

    public List<AllureLabel> getLabels() {
        return labels == null ? Collections.<AllureLabel>emptyList() : labels;
    }
}
