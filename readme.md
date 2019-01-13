<h1 align="center">
	{{Brackets}}
	<br>
	<img alt="" src="https://travis-ci.org/apicart/brackets.svg?branch=master">
	<img alt="" src="https://img.shields.io/github/license/apicart/brackets.svg">
</h1>

- Small, flexible, easy to use, component-oriented javascript template engine.
- ✅ **8 Kb minified (3 Kb Gzipped)**
- ✅ Supports IE 10 +
- ✅ [TRY IT ON CODEPEN](https://codepen.io/apicart/pen/OraYJj)

**Content**
- [Hello World!](https://github.com/apicart/brackets/blob/master/readme.md#hello-world)
- [Cache](https://github.com/apicart/brackets/blob/master/readme.md#cache)
- [Templates](https://github.com/apicart/brackets/blob/master/readme.md#templates)
- [Events](https://github.com/apicart/brackets/blob/master/readme.md#events)
- [Event handlers](https://github.com/apicart/brackets/blob/master/readme.md#event-handlers)
- [Macros](https://github.com/apicart/brackets/blob/master/readme.md#macros)
- [Filters](https://github.com/apicart/brackets/blob/master/readme.md#filters)
- [Components](https://github.com/apicart/brackets/blob/master/readme.md#components)

## Installation
Brackets are under development and therefore they are not yet available on npm. You can use the cdn link.

```html
<script src="https://cdn.jsdelivr.net/gh/apicart/brackets/dist/brackets.min.js"></script>
```

## Hello World!
Let's start with a simple example. We will dump the text into the `#app` element. The text is stored in the data object in the text parameter. Variables in have `$` the before name.
```html
<div id="app">
	{{$text}}
</div>
<script>
Brackets.render({
	el: '#app',
	data: {
		text: "I ❤️ Brackets!"
	}
});
</script>
```

```
I ❤️ Brackets!
```

## Cache
Cache speed's up the templates rendering time. Just add the `cacheKey` parameter with unique value and that's it.
This will save the compiled code of the template. The code is then reused with provided values. It doesnt cache the rendered template.

```html
<div id="app">
	{{$text}}
</div>
<script>
Brackets.render({
	el: '#app',
	cacheKey: 'test',
	data: {
		text: "I ❤️ Brackets!"
	}
});
</script>
```

## Templates
The template that should be rendered can be set in multiple ways. In the example above, the template was loaded from target element.
However, it is possible to set the template parameter that will be a text you want to render or an id selector of the element from where you want to load the template.

In this example, the template is loaded from the template parameter.
```html
<div id="app"></div>
<script>
Brackets.render({
	el: '#app',
	cacheKey: 'test',
	data: {
		text: "I ❤️ Brackets!"
	},
	template: '{{$text}}'
});
</script>
```

Now lets load the template from the `#template` element
(you should not load complicated templates from typical html elements because it can cause unexpected errors, we recommend to use `<template>...</template>` elements or `<script type="text/plain">...</script>` for providing your templates).

```html
<div id="app"></div>
<template id="template">
	{{$text}}
</template>
<script>
Brackets.render({
	el: '#app',
	cacheKey: 'test',
	data: {
		text: "I ❤️ Brackets!"
	},
	template: '#template'
});
</script>
```

## Events
Before the rendering method is called, the beforeRender method is initialized. When the rendering is done, the afterRender method is called. Those methods can serve for editing parameters
before rendering and to another actions after the rendering.
Those methods receives whole configuration object as `this` parameter.

```html
<div id="app">
	{{$number}}
</div>
<script>
Brackets.render({
	el: '#app',
	data: {
		number: 1
	},
	beforeRender: function () {
		this.data.number += 1;
	},
	afterRender: function () {
		alert("Generated number is " + this.data.number);
	}
});
</script>
```

## Event Handlers
During the development, you will probably need some interactivity. For example after clicking on a button.
You can do it in two ways as follows. First one is by providing to `b-on="event triggeredProcess, event2 anotherTriggeredProcess"`
or by a function `b-on="event function(), event2 function2()"`;
Methods receives event and parameters arguments. Arguments are always string.
Inside the methods, you can access and change the data object through `this.someVariable`.

```html
<div id="app">
	{{$number}}<br>
	<button b-on="click showAlert(Clicked 1!); click number ++">{{$firstButtonText}}</button><br>
	<button b-on="click secondButtonText = 'Clicked 2!'; click showAlert()">{{$secondButtonText}}</button>
</div>
<script>
Brackets.render({
	el: '#app',
	data: {
		number: 0,
		firstButtonText: 'Click me 1!',
		secondButtonText: 'Click me 2!'
	},
	methods: {
		showAlert: function (event, parameters) {
			if (parameters) {
				this.firstButtonText = parameters;
			}
			alert('Hello World!');
		}
	}
});
</script>
```

## Macros
There are the following macros provided by default.

### Conditions
<table>
   <tbody>
      <tr>
         <td style="text-align:center">{{if $cond}} … {{elseif $cond}} … {{else}} … {{/if}}</td>
         <td style="text-align:center">If condition</td>
      </tr>
   </tbody>
</table>

### Loops
<table>
   <tbody>
      <tr>
         <td style="text-align:center">{{for condition} … {/for}</td>
         <td style="text-align:center">For loop</td>
      </tr>
      <tr>
         <td style="text-align:center">{{while condition}} … {/while}</td>
         <td style="text-align:center">While loop</td>
      </tr>
      <tr>
         <td style="text-align:center">{{continueIf condition}}</td>
         <td style="text-align:center">Conditional jump to the next iteration</td>
      </tr>
      <tr>
         <td style="text-align:center">{{breakIf condition}</td>
         <td style="text-align:center">Conditional loop break</td>
      </tr>
   </tbody>
</table>

### Variables
<table>
   <tbody>
      <tr>
         <td style="text-align:center">{{var foo = value}}</td>
         <td style="text-align:center">Creates variable</td>
      </tr>
   </tbody>
</table>

### Other
<table>
   <tbody>
      <tr>
         <td style="text-align:center">{{dump variable}}</td>
         <td style="text-align:center">Similar to console.log()</td>
      </tr>
      <tr>
         <td style="text-align:center">{{js code}}</td>
         <td style="text-align:center">Allows you to write pure javascript</td>
      </tr>
      <tr>
         <td style="text-align:center">{{component name, param1: value, parameter2: value}}</td>
         <td style="text-align:center">Allows you to reuse components</td>
      </tr>
   </tbody>
</table>

### How to create macro
Macro in the context of the template engine is a piece of executable code.
First we will create a simple macro that will execute alert function. The macro name is *alert* and the parameter is *number*.
Macro is separated into two parts `{{<name> <parameters>}}`. `#0` is a placeholder on which place the `<parameters>` will be placed.
In our case, the `#0` will be replaced by `1`.

```html
<div id="app">
	{{alert number}}
</div>
<script>
Brackets
	.addMacro('alert', 'alert(#0);')
	.render({
		el: '#app',
		data: {
			number: 1
		}
	});
</script>
```

Macro can also be a function. In another example, we will use the `_template` variable available during the rendering.
The `_template` is used return the generated template. We will used it, because we want to return a content from out macro.
The code during the compilation is separated by [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) or by single quotes (depends on browser support).
The correct separator is stored in the `Brackets.templateLiteral` variable and you should use it to prevent incompatibility with older browsers.
On the end of the macro, there is a semicolon. In case you do not provide the semicolon, the compilation will end with an error.

```html
<div id="app">
	{{dumpNumber number}}
</div>
<script>
var sep = Brackets.templateLiteral;
Brackets
	.addMacro('dumpNumber', function () {
		return '_template +=' + sep + 'Number: ' +  sep + ' + number;'
	})
	.render({
		el: '#app',
		data: {
			number: 1
		}
	});
</script>
```

```
Number: 1
```

## Filters
Filters are used for editing values from variables.
As an example, we will create a filter called `firstToUpper` and it will convert the first character to a capital letter.

```html
<div id="app">
	{{$text|firstToUpper}}
</div>
<script>
Brackets
	.addFilter('firstToUpper', function (text) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	})
	.render({
		el: '#app',
		data: {
			text: 'text'
		}
	});
</script>
```


Filters can receive multiple arguments. The arguments must be added after the colon and must be separated by a comma.
The example below returns the default *first * text and attaches the text 'second' and 'third'.

```html
<div id="app">
	{{$text|appendWords: 'second', 'third'}}
</div>
<script>
Brackets
	.addFilter('appendWords', function (text, firstParameter, secondParameter) {
		return text + ', ' + firstParameter + ', ' + secondParameter
	})
	.render({
		el: '#app',
		data: {
			text: 'First'
		}
	});
</script>
```

```
First, second, third
```

## Components
Components helps to create your code more reusable. You can for example create a button with some functionality
and use it on multiple places with different parameters.

In the first example, there is a component that returns a text. The text is different in each `.app` element.
Components can receive arguments. Arguments are placed behind comma (`,`) and are also separated by comma (`,`)

```html
<div class="app">{{component text}}</div>
<div class="app">{{component text, text: 'Second app'}}</div>
<div class="app">{{component text, text: 'Third app'}}</div>
<script>
Brackets
	.addComponent('text', {
		data: {
			text: 'First app'
		},
		template: '{{$text}}'
	})
	.render({
		el: '.app',
		data: {
			text: 'First'
		}
	});
</script>
```

Now, let's take a look on nested components with some methods. If the component is nested inside another component,
then it's parent component must have some root element in which the component is placed.

```html
<div class="app">{{component shareArticle, articleName: 'Article 1'}}</div>
<div class="app">{{component shareArticle, articleName: 'Article 2'}}</div>
<div class="app">{{component shareArticle, articleName: 'Article 3'}}</div>
<script>
Brackets
	.addComponent('shareButton', {
		data: {
			number: 0
		},
		methods: {
			updateNumber: function () {
				this.number ++;
			}
		},
		template: '<button b-on="click updateNumber()">Share ({{$number}})</button>'
	})
	.addComponent('shareArticle', {
		template: '<div>{{$articleName}} => {{component shareButton}}</div>'
	})
	.render({
		el: '.app'
	});
</script>
```
