function buildForm(options, containerId)
{
    var container = document.getElementById(containerId);
    var table = document.createElement('table');
    container.appendChild(table);

    for (var optionName in options)
    {
        var row = document.createElement('tr');
        var cell = document.createElement('td');

        var option = options[optionName];

        // label
        var optionLabel = document.createElement('label');
        optionLabel.innerHTML = option.html;
        optionLabel.setAttribute('for', optionName);

        cell.appendChild(optionLabel);
        row.appendChild(cell);

        cell = document.createElement('td');

        // input
        var input = document.createElement('input');
        input.id = optionName;
        input.name = optionName;
        if (option.type == 'checkbox')
        {
          input.type = 'checkbox';
        }

        if (localStorage[optionName] != undefined)
        {
            input.value = localStorage[optionName];
        } else
        {
            input.value = option.defaultValue;
        }

                if (option.type == 'checkbox')
        {

          input.checked = parseInt(input.value);
        }

        cell.appendChild(input);
        row.appendChild(cell);
        table.appendChild(row);
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
                        if (element.type == 'checkbox')
            {
            if (element.checked)
              localStorage[optionName] = 1;
            else
                            localStorage[optionName] = 0;
            }
        }
    }

    var results = document.getElementById('results');
    results.innerHTML = "Options updated!"
}