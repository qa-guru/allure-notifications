<#import "utils.ftl" as utils>
<#compress>
    **${phrases.results}:**
    **-${phrases.environment}:** ${env}
    **-${phrases.comment}:** ${comm}
    **-${phrases.scenario.duration}:** **${time}**
    **-${phrases.scenario.totalScenarios}:** ${total}
    <#if passed != 0 > **-${phrases.scenario.totalPassed}:** ${passed} **<@utils.printPercentage input=passed total=total />**</#if>
    <#if failed != 0 > **-${phrases.scenario.totalFailed}:** ${failed} **<@utils.printPercentage input=failed total=total />** </#if>
    <#if broken != 0 > **-${phrases.scenario.totalBroken}:** ${broken} </#if>
    <#if unknown != 0 > **-${phrases.scenario.totalUnknown}:** ${unknown} </#if>
    <#if skipped != 0 > **-${phrases.scenario.totalSkipped}:** ${skipped} </#if>

    <#if suitesSummaryJson??>
    <#assign suitesData = suitesSummaryJson?eval_json>
    **-${phrases.numberOfSuites}:** **${suitesData.total}**
    <#list suitesData.items as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        **-${phrases.suiteName}:** **${suite.name}**
        **-${phrases.scenario.totalScenarios}:** **${suite.statistic.total}**
        <#if suitePassed != 0 > **-${phrases.scenario.totalPassed}:** ${suitePassed}</#if>
        <#if suiteFailed != 0 > **-${phrases.scenario.totalFailed}:** ${suiteFailed}</#if>
        <#if suiteBroken != 0 > **-${phrases.scenario.totalBroken}:** ${suiteBroken}</#if>
        <#if suiteUnknown != 0 > **-${phrases.scenario.totalUnknown}:** ${suiteUnknown}</#if>
        <#if suiteSkipped != 0 > **-${phrases.scenario.totalSkipped}:** ${suiteSkipped}</#if>
    </#list>
    </#if>
    <#if reportLink??>**${phrases.reportAvailableAtLink}:** ${reportLink}</#if>
</#compress>