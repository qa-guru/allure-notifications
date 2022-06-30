<#compress>
*${results}:*
    *${environment}:* ${env}
    *${comment}:* ${comm}
    *${duration}:* ${time}
    *${totalScenarios}:* ${total}
    <#if passed != 0 > *${totalPassed}:* ${passed} </#if>
    <#if failed != 0 > *${totalFailed}:* ${failed} </#if>
    <#if broken != 0 > *${totalBroken}:* ${broken} </#if>
    <#if unknown != 0 >*${totalUnknown}:* ${unknown} </#if>
    <#if skipped != 0 >*${totalSkipped}:* ${skipped} </#if>
    <#if passedPercentage != 0 >*% ${ofPassedTests}:* ${passedPercentage} </#if>
    <#if failedPercentage != 0 >*% ${ofFailedTests}:* ${failedPercentage} </#if>
    *${reportAvailableAtLink}:* ${reportLink}
</#compress>