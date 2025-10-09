<#import "utils.ftl" as utils>
<#compress>
*${phrases.results}:* <br>
    *${phrases.environment}:* ${environment} <br>
    *${phrases.comment}:* ${comment} <br>
    *${phrases.scenario.duration}:* ${time} <br>
    *${phrases.scenario.totalScenarios}:* ${statistic.total} <br>
    <#if statistic.passed != 0 >
        *${phrases.scenario.totalPassed}:* ${statistic.passed} <@utils.printPercentage input=statistic.passed total=statistic.total /> <br>
    </#if>
    <#if statistic.failed != 0 >
        *${phrases.scenario.totalFailed}:* ${statistic.failed} <@utils.printPercentage input=statistic.failed total=statistic.total /> <br>
    </#if>
    <#if statistic.broken != 0 >
        *${phrases.scenario.totalBroken}:* ${statistic.broken} <br>
    </#if>
    <#if statistic.unknown != 0 >
        *${phrases.scenario.totalUnknown}:* ${statistic.unknown} <br>
    </#if>
    <#if statistic.skipped != 0 >
        *${phrases.scenario.totalSkipped}:* ${statistic.skipped} <br>
    </#if>

    <#if suitesSummaryJson??>
    <#assign suitesData = suitesSummaryJson?eval_json>
    *${phrases.numberOfSuites}:* ${suitesData.total} <br>
    <#list suitesData.items as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        *${phrases.suiteName}:* ${suite.name}
        > *${phrases.scenario.totalScenarios}:* ${suite.statistic.total} <br>
        <#if suitePassed != 0 >> *${phrases.scenario.totalPassed}:* ${suitePassed} <br></#if>
        <#if suiteFailed != 0 >> *${phrases.scenario.totalFailed}:* ${suiteFailed} <br></#if>
        <#if suiteBroken != 0 >> *${phrases.scenario.totalBroken}:* ${suiteBroken} <br></#if>
        <#if suiteUnknown != 0 >> *${phrases.scenario.totalUnknown}:* ${suiteUnknown} <br></#if>
        <#if suiteSkipped != 0 >> *${phrases.scenario.totalSkipped}:* ${suiteSkipped} <br></#if>
    </#list>
    </#if>
    <#if reportLink??>*${phrases.reportAvailableAtLink}:* ${reportLink} <br></#if>
    <#if chartSource??>${chartSource}</#if> <br>
</#compress>