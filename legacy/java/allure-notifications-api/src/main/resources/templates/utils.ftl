<#assign linkKeys = ["report", "dashboard", "testops", "build"]>

<#macro printPercentage input total>
    (${( (input * 100.00) / total )?string("##.#")} %)<#t>
</#macro>

<#macro printHtmlLinks links phrases>
<#if links??>
<#list linkKeys as key>
<#if links[key]??><b>${phrases.links[key]}:</b> <a href="${links[key]}">${links[key]}</a></#if>
</#list>
</#if>
</#macro>

<#macro printTelegramLinks links phrases>
<#if links??>
<#list linkKeys as key>
<#if links[key]??><b>${phrases.links[key]}:</b> <a href="${links[key]}">${links[key]}</a></#if>
</#list>
</#if>
</#macro>

<#macro printMarkdownLinks links phrases>
<#if links??>
<#list linkKeys as key>
<#if links[key]??>*${phrases.links[key]}:* ${links[key]}</#if>
</#list>
</#if>
</#macro>

<#macro printTeamsLinks links phrases>
<#if links??>
<#list linkKeys as key>
<#if links[key]??>**${phrases.links[key]}:** [${links[key]}](${links[key]})</#if>
</#list>
</#if>
</#macro>

<#macro printRocketLinks links phrases>
<#if links??>
<#list linkKeys as key>
<#if links[key]??>**${phrases.links[key]}:** ${links[key]}</#if>
</#list>
</#if>
</#macro>
