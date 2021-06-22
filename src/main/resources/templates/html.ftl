<#compress>
<b>${results}:</b>
    <b>${environment}:</b> ${env}
    <b>${duration}:</b> ${time}
    <b>${totalScenarios}:</b> ${total}
    <#if passed != 0 ><b>${totalPassed}:</b> ${passed} </#if>
    <#if failed != 0 ><b>${totalFailed}:</b> ${failed} </#if>
    <#if broken != 0 ><b>${totalBroken}:</b> ${broken} </#if>
    <#if unknown != 0 ><b>${totalUnknown}:</b> ${unknown} </#if>
    <#if skipped != 0 ><b>${totalSkipped}:</b> ${skipped} </#if>
    <#if passedPercentage != 0 ><b>% ${ofPassedTests}:</b> ${passedPercentage} </#if>
    <#if failedPercentage != 0 ><b>% ${ofFailedTests}:</b> ${failedPercentage} </#if>
    <b>${reportAvailableByLink}:</b> ${reportLink}
</#compress>