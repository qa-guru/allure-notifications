<#import "utils.ftl" as utils>
<#compress>
    <h3>${phrases.results}:</h3>
    <b>${phrases.environment}: </b>${environment}<br/>
    <b>${phrases.comment}: </b>${comment}<br/>
    <b>${phrases.scenario.duration}: </b>${time}<br/>
    <b>${phrases.scenario.totalScenarios}: </b>${statistic.total}
    <ul>
        <#if statistic.passed != 0 >
            <li><b>${phrases.scenario.totalPassed}: </b>${statistic.passed} <@utils.printPercentage input=statistic.passed total=statistic.total /></li>
        </#if>
        <#if statistic.failed != 0 >
            <li><b>${phrases.scenario.totalFailed}: </b>${statistic.failed} <@utils.printPercentage input=statistic.failed total=statistic.total /></li>
        </#if>
        <#if statistic.broken != 0 >
            <li><b>${phrases.scenario.totalBroken}: </b>${statistic.broken}</li>
        </#if>
        <#if statistic.unknown != 0 >
            <li><b>${phrases.scenario.totalUnknown}: </b>${statistic.unknown}</li>
        </#if>
        <#if statistic.skipped != 0 >
            <li><b>${phrases.scenario.totalSkipped}: </b>${statistic.skipped}</li>
        </#if>
    </ul>
    <#if reportLink??><b>${phrases.reportAvailableAtLink}:</b> <a href=${reportLink}>${reportLink}</a></#if>
    <br/>
    <h3>Custom section:</h3>
    Custom data 1: ${customData.variable1}<br/>
    Custom data 2: ${customData.variable2}
</#compress>