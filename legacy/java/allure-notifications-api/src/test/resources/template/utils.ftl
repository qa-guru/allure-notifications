<!-- Copy of utils.ftl from source, used to test loading of templates as files -->
<#macro printPercentage input total>
    (${( (input * 100.00) / total )?string("##.#")} %)<#t>
</#macro>
