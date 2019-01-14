<h1 align="center">
	<img src="https://github.com/apicart/brackets/blob/master/logo.png">
	<br>
	<a href="https://travis-ci.org/apicart/brackets" target="blank" rel="noopener"><img alt="" src="https://travis-ci.org/apicart/brackets.svg?branch=master"></a>
	<img alt="" src="https://img.shields.io/github/license/apicart/brackets.svg">
</h1>

- Small, flexible, easy to use, component-oriented javascript template engine.
- ✅ **8 Kb minified (3 Kb Gzipped)**
- ✅ Supports IE 10 +
- ✅ [TRY IT ON CODEPEN](https://codepen.io/apicart/pen/OraYJj)

**Content**
- [Get Started](https://github.com/apicart/brackets/blob/master/readme.md#getting-started)
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

## Getting Started
Let's start with a simple example. We will render a text stored in the data object into the `#app` element. Notice that variables have dollar sign `$` before the name.

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
Cache speed's up the rendering process by caching the compiled template (it doesn't cache the rendered content). Just add the `cacheKey` parameter with unique value and that's it.

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
The template you want to render can be provided in a multiple ways. In the example above, the template was loaded from the target element `#app`. 

Another way to provide the template is setting it directly as a text in the template parameter.

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

Template parameter can also receive an id selector `#elementId`. If so, the template will be loaded from the given element (you shouldn't load complicated templates from a typical html elements because it can cause unexpected errors, we recommend to use `<template>...</template>` or `<script type="text/plain">...</script>` elements as template providers).

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
During the whole rendering process, there are triggered two events. 
- Before render (beforeRender) - this event is triggered before the whole rendering process starts
- After render (afterRender) - this event is triggered after the rendering process is complete

Both events triggers methods with the configuration object provided as `this`.

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
Every website needs some interactivity. For example after clicking on a button. Every element that should be interactive must have the `b-on=""` attribute. There you can set the target event and what should happen when is triggered.
The syntax is following `b-on="<event name> <callback>; <event name> <triggered callback>, ..."`.
The callback can have two forms. Direct functionality, where the function is connected to the data object like `b-on="click number++` or an independent function `b-on="click updateNumber()"`. If you want the callback to be a function, you can provide arguments. Those arguments are passed into the target function and are always a string so you have to convert it if you want to get for example a number from it. `b-on="click showAlert(Some text)"`

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
There are the following macros defined by default.

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

### How to create a macro
Macro in the context of the template engine is a piece of executable code.

First we will create a simple macro that will execute alert function. The macro name will be *alert* and *number* its parameter.
Macro is separated into two parts `{{<name> <parameters>}}`. `#0` is a placeholder on which place the `<parameters>` will be placed.
In the following case, the `#0` will be replaced by `1`.

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
The `_template` is used to return the generated template. We will used it, because we want to return a content from our macro.

The code during the compilation is separated by [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) or by single quotes (depends on browser support). The correct separator is stored in the `Brackets.templateLiteral` variable and you should use it to prevent incompatibility with older browsers.

On the end of the macro, there is a semicolon. In case you do not provide it the compilation will end with an error.

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
Filters are used for interaction with values from variables.
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
The example below returns the default *first* text and attaches the text 'second' and 'third'.

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
Components can receive arguments. Arguments are placed behind a comma (`,`) and are also separated by a comma (`,`).

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

Now, let's take a look on nested components. If the component is nested inside another component,
then it's parent component must have some root element in which the component is placed. The root element is not necessary for a plain text.

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
