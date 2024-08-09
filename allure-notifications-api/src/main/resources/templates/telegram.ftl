<#compress>
    <b>${results}:</b>
    <b>${environment}: </b>${env}
    <b>${comment}: </b>${comm}
    <b>${duration}: </b>${time}
    <b>${totalScenarios}: </b>${total}
    <#if passed != 0 ><b>${totalPassed}: </b>${passed} (${passedPercentage} %)</#if>
    <#if failed != 0 ><b>${totalFailed}: </b>${failed} (${failedPercentage} %)</#if>
    <#if broken != 0 ><b>${totalBroken}: </b>${broken}</#if>
    <#if unknown != 0 ><b>${totalUnknown}: </b>${unknown}</#if>
    <#if skipped != 0 ><b>${totalSkipped}: </b>${skipped}</#if>

    <#if suitesSummaryJson??>
    <#assign suitesData = suitesSummaryJson?eval_json>
    <b>${numberOfSuites}: </b>${suitesData.total}
    <#list suitesData.items as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        <b>${suiteName}: </b>${suite.name}
        <code>${totalScenarios}: ${suite.statistic.total}</code>
        <#if suitePassed != 0 ><code>${totalPassed}: ${suitePassed}</code></#if>
        <#if suiteFailed != 0 ><code>${totalFailed}: ${suiteFailed}</code></#if>
        <#if suiteBroken != 0 ><code>${totalBroken}: ${suiteBroken}</code></#if>
        <#if suiteUnknown != 0 ><code>${totalUnknown}: ${suiteUnknown}</code></#if>
        <#if suiteSkipped != 0 ><code>${totalSkipped}: ${suiteSkipped}</code></#if>
    </#list>
    </#if>
    <#if reportLink??><b>${reportAvailableAtLink}:</b> <a href="${reportLink}">${reportLink}</a></#if>
</#compress>