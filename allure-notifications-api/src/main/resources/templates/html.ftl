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

    <#if suitesSummaryJson??>
    <#assign suitesData = suitesSummaryJson?eval_json>
    <b>${numberOfSuites}: </b>${suitesData.total}<br/>
    <#list suitesData.items as suite>
        <#assign suitePassed = suite.statistic.passed>
        <#assign suiteFailed = suite.statistic.failed>
        <#assign suiteBroken = suite.statistic.broken>
        <#assign suiteUnknown = suite.statistic.unknown>
        <#assign suiteSkipped = suite.statistic.skipped>

        <table style="border:1px solid black;">
          <tr>
            <td>
                <b>${suiteName}: </b>${suite.name}<br/>
                <b>${totalScenarios}: </b>${suite.statistic.total}<br/>
                <#if suitePassed != 0 ><li><b>${totalPassed}: </b>${suitePassed}</li></#if>
                <#if suiteFailed != 0 ><li><b>${totalFailed}: </b>${suiteFailed}</li></#if>
                <#if suiteBroken != 0 ><li><b>${totalBroken}: </b>${suiteBroken}</li></#if>
                <#if suiteUnknown != 0 ><li><b>${totalUnknown}: </b>${suiteUnknown}</li></#if>
                <#if suiteSkipped != 0 ><li><b>${totalSkipped}: </b>${suiteSkipped}</li></#if>
            </td>
          </tr>
        </table><br/>
    </#list>
    </#if>
    <#if reportLink??><b>${reportAvailableAtLink}:</b> <a href=${reportLink}>${reportLink}</a></#if>
</#compress>