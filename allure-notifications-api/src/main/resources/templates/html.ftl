<#import "utils.ftl" as utils>
<#compress>
    <h3>${phrases.results}:</h3>
    <b>${phrases.environment}: </b>${environment}<br/>
    <b>${phrases.comment}: </b>${comment}<br/>
    <b>${phrases.scenario.duration}: </b>${time}<br/>
    <b>${phrases.scenario.totalScenarios}: </b>${statistic.total}
    <ul>
        <#if statistic.passed != 0 >
            <li><b>${phrases.scenario.totalPassed}: </b>${statistic.passed} <@utils.printPercentage input=statistic.passed total=statistic.total /></li>
        </#if>
        <#if statistic.failed != 0 >
            <li><b>${phrases.scenario.totalFailed}: </b>${statistic.failed} <@utils.printPercentage input=statistic.failed total=statistic.total /></li>
        </#if>
        <#if statistic.broken != 0 >
            <li><b>${phrases.scenario.totalBroken}: </b>${statistic.broken}</li>
        </#if>
        <#if statistic.unknown != 0 >
            <li><b>${phrases.scenario.totalUnknown}: </b>${statistic.unknown}</li>
        </#if>
        <#if statistic.skipped != 0 >
            <li><b>${phrases.scenario.totalSkipped}: </b>${statistic.skipped}</li>
        </#if>
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