*Jenkins Job:* ${job}
*${environment}:* ${env}
<#if passed != 0 > *${totalPassed}:* ${passed} </#if>
<#if failed != 0 > *${totalFailed}:* ${failed} </#if>
*${reportAvailableByLink}:* ${reportLink}