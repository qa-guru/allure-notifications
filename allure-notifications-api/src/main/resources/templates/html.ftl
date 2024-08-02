<#compress>
    <h3>${results}:</h3>
    <b>${environment}: </b>${env}<br/>
    <b>${comment}: </b>${comm}<br/>
    <b>${duration}: </b>${time}<br/>
    <b>${totalScenarios}: </b>${total}
    <ul>
        <#if passed != 0 ><li><b>${totalPassed}: </b>${passed} (${passedPercentage} %)</li></#if>
        <#if failed != 0 ><li><b>${totalFailed}: </b>${failed} (${failedPercentage} %)</li></#if>
        <#if broken != 0 ><li><b>${totalBroken}: </b>${broken}</li></#if>
        <#if unknown != 0 ><li><b>${totalUnknown}: </b>${unknown}</li></#if>
        <#if skipped != 0 ><li><b>${totalSkipped}: </b>${skipped}</li></#if>
    </ul>
    <#if reportLink??><b>${reportAvailableAtLink}:</b> <a href=${reportLink}>${reportLink}</a></#if>
</#compress>