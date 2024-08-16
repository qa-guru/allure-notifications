<#compress>
    <b>${phrases.results}:</b>
    <b>${phrases.environment}: </b>${env}
    <b>${phrases.comment}: </b>${comm}
    <b>${phrases.scenario.duration}: </b>${time}
    <b>${phrases.scenario.totalScenarios}: </b>${total}
    <#if passed != 0 ><b>${phrases.scenario.totalPassed}: </b>${passed} (${passedPercentage} %)</#if>
    <#if failed != 0 ><b>${phrases.scenario.totalFailed}: </b>${failed} (${failedPercentage} %)</#if>
    <#if broken != 0 ><b>${phrases.scenario.totalBroken}: </b>${broken}</#if>
    <#if unknown != 0 ><b>${phrases.scenario.totalUnknown}: </b>${unknown}</#if>
    <#if skipped != 0 ><b>${phrases.scenario.totalSkipped}: </b>${skipped}</#if>

    <#if suitesSummaryJson??>
    <#assign suitesData = suitesSummaryJson?eval_json>
    <b>${phrases.numberOfSuites}: </b>${suitesData.total}
    <#list suitesData.items as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        <b>${phrases.suiteName}: </b>${suite.name}
        <code>${phrases.scenario.totalScenarios}: ${suite.statistic.total}</code>
        <#if suitePassed != 0 ><code>${phrases.scenario.totalPassed}: ${suitePassed}</code></#if>
        <#if suiteFailed != 0 ><code>${phrases.scenario.totalFailed}: ${suiteFailed}</code></#if>
        <#if suiteBroken != 0 ><code>${phrases.scenario.totalBroken}: ${suiteBroken}</code></#if>
        <#if suiteUnknown != 0 ><code>${phrases.scenario.totalUnknown}: ${suiteUnknown}</code></#if>
        <#if suiteSkipped != 0 ><code>${phrases.scenario.totalSkipped}: ${suiteSkipped}</code></#if>
    </#list>
    </#if>
    <#if reportLink??><b>${phrases.reportAvailableAtLink}:</b> <a href="${reportLink}">${reportLink}</a></#if>
</#compress>