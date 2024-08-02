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
    <#if reportLink??><b>${reportAvailableAtLink}:</b> <a href="${reportLink}">${reportLink}</a></#if>
</#compress>