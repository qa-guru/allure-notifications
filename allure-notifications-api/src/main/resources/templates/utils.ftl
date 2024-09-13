<#macro printPercentage input total>
    (${( (input * 100.00) / total )?string("##.#")} %)<#t>
</#macro>
