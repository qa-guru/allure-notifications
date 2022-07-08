<#compress>
    <br/><b>${results}:</b>
    <br/><b>${environment}:</b> ${env}
    <br/><b>${comment}:</b> ${comm}
    <br/><b>${duration}:</b> ${time}
    <br/><b>${totalScenarios}:</b> ${total}<br/>
    <br/><#if passed != 0 ><b>${totalPassed}:</b> ${passed} </#if>
    <br/> <#if failed != 0 ><b>${totalFailed}:</b> ${failed} </#if>
    <br/> <#if broken != 0 ><b>${totalBroken}:</b> ${broken} </#if>
    <br/> <#if unknown != 0 ><b>${totalUnknown}:</b> ${unknown} </#if>
    <br/><#if skipped != 0 ><b>${totalSkipped}:</b> ${skipped} </#if>
    <br/> <#if passedPercentage != 0 ><b>% ${ofPassedTests}:</b> ${passedPercentage} </#if>
    <br/><#if failedPercentage != 0 ><b>% ${ofFailedTests}:</b> ${failedPercentage} </#if>
    <#if reportLink??><br/> <b>${reportAvailableAtLink}:</b> <a href=${reportLink}>${reportLink}</a></#if>
</#compress>