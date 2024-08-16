<#compress>
    <h3>${phrases.results}:</h3>
    <b>${phrases.environment}: </b>${env}<br/>
    <b>${phrases.comment}: </b>${comm}<br/>
    <b>${phrases.scenario.duration}: </b>${time}<br/>
    <b>${phrases.scenario.totalScenarios}: </b>${total}
    <ul>
        <#if passed != 0 ><li><b>${phrases.scenario.totalPassed}: </b>${passed} (${passedPercentage} %)</li></#if>
        <#if failed != 0 ><li><b>${phrases.scenario.totalFailed}: </b>${failed} (${failedPercentage} %)</li></#if>
        <#if broken != 0 ><li><b>${phrases.scenario.totalBroken}: </b>${broken}</li></#if>
        <#if unknown != 0 ><li><b>${phrases.scenario.totalUnknown}: </b>${unknown}</li></#if>
        <#if skipped != 0 ><li><b>${phrases.scenario.totalSkipped}: </b>${skipped}</li></#if>
    </ul>

    <#if suitesSummaryJson??>
    <#assign suitesData = suitesSummaryJson?eval_json>
    <b>${phrases.numberOfSuites}: </b>${suitesData.total}<br/>
    <#list suitesData.items as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        <table style="border:1px solid black;">
          <tr>
            <td>
                <b>${phrases.suiteName}: </b>${suite.name}<br/>
                <b>${phrases.scenario.totalScenarios}: </b>${suite.statistic.total}<br/>
                <#if suitePassed != 0 ><li><b>${phrases.scenario.totalPassed}: </b>${suitePassed}</li></#if>
                <#if suiteFailed != 0 ><li><b>${phrases.scenario.totalFailed}: </b>${suiteFailed}</li></#if>
                <#if suiteBroken != 0 ><li><b>${phrases.scenario.totalBroken}: </b>${suiteBroken}</li></#if>
                <#if suiteUnknown != 0 ><li><b>${phrases.scenario.totalUnknown}: </b>${suiteUnknown}</li></#if>
                <#if suiteSkipped != 0 ><li><b>${phrases.scenario.totalSkipped}: </b>${suiteSkipped}</li></#if>
            </td>
          </tr>
        </table><br/>
    </#list>
    </#if>
    <#if reportLink??><b>${phrases.reportAvailableAtLink}:</b> <a href=${reportLink}>${reportLink}</a></#if>
</#compress>