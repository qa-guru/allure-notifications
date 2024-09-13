<#import "utils.ftl" as utils>
<#compress>
    <b>${phrases.results}:</b>
    <b>${phrases.environment}: </b>${environment}
    <b>${phrases.comment}: </b>${comment}
    <b>${phrases.scenario.duration}: </b>${time}
    <b>${phrases.scenario.totalScenarios}: </b>${statistic.total}
    <#if statistic.passed != 0 >
        <b>${phrases.scenario.totalPassed}: </b>${statistic.passed} <@utils.printPercentage input=statistic.passed total=statistic.total />
    </#if>
    <#if statistic.failed != 0 >
        <b>${phrases.scenario.totalFailed}: </b>${statistic.failed} <@utils.printPercentage input=statistic.failed total=statistic.total />
    </#if>
    <#if statistic.broken != 0 >
        <b>${phrases.scenario.totalBroken}: </b>${statistic.broken}
    </#if>
    <#if statistic.unknown != 0 >
        <b>${phrases.scenario.totalUnknown}: </b>${statistic.unknown}
    </#if>
    <#if statistic.skipped != 0 >
        <b>${phrases.scenario.totalSkipped}: </b>${statistic.skipped}
    </#if>

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