<#import "/templates/utils.ftl" as utils>
<#compress>
    <h3>${results}:</h3>
    <b>${environment}: </b>${env}<br/>
    <b>${comment}: </b>${comm}<br/>
    <b>${duration}: </b>${time}<br/>
    <b>${totalScenarios}: </b>${statistic.total}
    <ul>
        <#if statistic.passed != 0 >
            <li><b>${totalPassed}: </b>${statistic.passed} <@utils.printPercentage input=statistic.passed total=statistic.total /></li>
        </#if>
        <#if statistic.failed != 0 >
            <li><b>${totalFailed}: </b>${statistic.failed} <@utils.printPercentage input=statistic.failed total=statistic.total /></li>
        </#if>
        <#if statistic.broken != 0 >
            <li><b>${totalBroken}: </b>${statistic.broken}</li>
        </#if>
        <#if statistic.unknown != 0 >
            <li><b>${totalUnknown}: </b>${statistic.unknown}</li>
        </#if>
        <#if statistic.skipped != 0 >
            <li><b>${totalSkipped}: </b>${statistic.skipped}</li>
        </#if>
    </ul>
    <#if reportLink??><b>${reportAvailableAtLink}:</b> <a href=${reportLink}>${reportLink}</a></#if>
</#compress>