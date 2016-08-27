# Template

A basic template engine, built to show how to create them.

```js
var string = [
    "<ul>",
        "${#if responses.length}",
            "${#each responses as response}",
                "<li>${response.name}</li>",
            "${#end each}",
        "${#end if}",
        "${#if !responses.length}",
            "<li><em>No responses</em></li>",
        "${#end if}",
    "</ul>"
].join("\n");

var data = {
    responses: [
        {name: "Alpha"},
        {name: "Bravo"},
        {name: "Charlie"}
    ]
};

var myTemplate = template(string);
myTemplate.render(data);
// ->
//  <ul>
//      <li>Alpha</li>
//      <li>Bravo</li>
//      <li>Charlie</li>
//  </ul>
```

Full details can be found [on my blog](http://sk80.co.uk/2016/08/template-engine-groundwork/).
