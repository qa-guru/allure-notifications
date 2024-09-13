<#import "utils.ftl" as utils>
<#compress>
*${phrases.results}:*
    *${phrases.environment}:* ${environment}
    *${phrases.comment}:* ${comment}
    *${phrases.scenario.duration}:* ${time}
    *${phrases.scenario.totalScenarios}:* ${statistic.total}
    <#if statistic.passed != 0 >
        *${phrases.scenario.totalPassed}:* ${statistic.passed} <@utils.printPercentage input=statistic.passed total=statistic.total />
    </#if>
    <#if statistic.failed != 0 >
        *${phrases.scenario.totalFailed}:* ${statistic.failed} <@utils.printPercentage input=statistic.failed total=statistic.total />
    </#if>
    <#if statistic.broken != 0 >
        *${phrases.scenario.totalBroken}:* ${statistic.broken}
    </#if>
    <#if statistic.unknown != 0 >
        *${phrases.scenario.totalUnknown}:* ${statistic.unknown}
    </#if>
    <#if statistic.skipped != 0 >
        *${phrases.scenario.totalSkipped}:* ${statistic.skipped}
    </#if>

    <#if suitesSummaryJson??>
    <#assign suitesData = suitesSummaryJson?eval_json>
    *${phrases.numberOfSuites}:* ${suitesData.total}
    <#list suitesData.items as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        *${phrases.suiteName}:* ${suite.name}
        > *${phrases.scenario.totalScenarios}:* ${suite.statistic.total}
        <#if suitePassed != 0 >> *${phrases.scenario.totalPassed}:* ${suitePassed}</#if>
        <#if suiteFailed != 0 >> *${phrases.scenario.totalFailed}:* ${suiteFailed}</#if>
        <#if suiteBroken != 0 >> *${phrases.scenario.totalBroken}:* ${suiteBroken}</#if>
        <#if suiteUnknown != 0 >> *${phrases.scenario.totalUnknown}:* ${suiteUnknown}</#if>
        <#if suiteSkipped != 0 >> *${phrases.scenario.totalSkipped}:* ${suiteSkipped}</#if>
    </#list>
    </#if>
    <#if reportLink??>*${phrases.reportAvailableAtLink}:* ${reportLink}</#if>
</#compress>