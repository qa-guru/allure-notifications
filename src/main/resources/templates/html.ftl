<b>Jenkins Job:</b> ${job}
<b>${environment}:</b> ${env}
<#if passed != 0 ><b>${totalPassed}:</b> ${passed} </#if>
<#if failed != 0 ><b>${totalFailed}:</b> ${failed} </#if>
<b>${reportAvailableByLink}:</b> ${reportLink}