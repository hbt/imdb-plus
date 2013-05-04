function buildForm(options, containerId)
{
    var container = document.getElementById(containerId);
    for (var optionName in options)
    {
        var option = options[optionName];

        var optionContainer = document.createElement('div');
        var optionLabel = document.createElement('label');
        optionLabel.innerHTML = option.html;
        optionContainer.appendChild(optionLabel);

        var input = document.createElement('input');
        input.id = optionName;
        if (localStorage[optionName] != undefined)
        {
          input.value = localStorage[optionName];
        }
        else
        {
        input.value = option.defaultValue;
        }

        optionContainer.appendChild(input);

        container.appendChild(optionContainer);


    }
}

function update(options)
{
    for (var optionName in options)
    {
        var element = document.getElementById(optionName);
        if (element)
        {
            localStorage[optionName] = element.value;
        }
    }

    var results = document.getElementById('results');
    results.innerHTML = "Options updated!"

}