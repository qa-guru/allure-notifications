<#compress>
*${results}:*
    *${environment}:* ${env}
    *${comment}:* ${comm}
    *${duration}:* ${time}
    *${totalScenarios}:* ${total}
    <#if passed != 0 > *${totalPassed}:* ${passed} (${passedPercentage} %)</#if>
    <#if failed != 0 > *${totalFailed}:* ${failed} (${failedPercentage} %)</#if>
    <#if broken != 0 > *${totalBroken}:* ${broken} </#if>
    <#if unknown != 0 >*${totalUnknown}:* ${unknown} </#if>
    <#if skipped != 0 >*${totalSkipped}:* ${skipped} </#if>

    <#if totalSuites??>*${numberOfSuites}:* ${totalSuites}</#if>
    <#list suites![] as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        *${suiteName}:* ${suite.name}
        > *${totalScenarios}:* ${suite.statistic.total}
        <#if suitePassed != 0 >> *${totalPassed}:* ${suitePassed}</#if>
        <#if suiteFailed != 0 >> *${totalFailed}:* ${suiteFailed}</#if>
        <#if suiteBroken != 0 >> *${totalBroken}:* ${suiteBroken}</#if>
        <#if suiteUnknown != 0 >> *${totalUnknown}:* ${suiteUnknown}</#if>
        <#if suiteSkipped != 0 >> *${totalSkipped}:* ${suiteSkipped}</#if>
    </#list>
    <#if reportLink??>*${reportAvailableAtLink}:* ${reportLink}</#if>
</#compress>