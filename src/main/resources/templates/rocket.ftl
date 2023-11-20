<#compress>
    **${results}:**
    **-${environment}:** ${env}
    **-${comment}:** ${comm}
    **-${duration}:** **${time}**
    **-${totalScenarios}:** ${total}
    <#if passed != 0 > **-${totalPassed}:** ${passed} **(${passedPercentage} %)**</#if>
    <#if failed != 0 > **-${totalFailed}:** ${failed} **(${failedPercentage} %)** </#if>
    <#if broken != 0 > **-${totalBroken}:** ${broken} </#if>
    <#if unknown != 0 > **-${totalUnknown}:** ${unknown} </#if>
    <#if skipped != 0 > **-${totalSkipped}:** ${skipped} </#if>
    <#if reportLink??>**${reportAvailableAtLink}:** ${reportLink}</#if>
</#compress>