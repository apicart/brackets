## Brackets template engine
Brackets je jednoduchý a malý šablonovací systém, který zjednodušuje tvorbu webových stránek.
Umožňuje vypisování proměnných, zvládá logiku v šablonách, volání filtrů a poslouchat na události.

## Začínáme
Ukážeme si jak vypsat proměnnou. Název proměnné obalíme do dvou závorek a dáme před ni dolar => `{{$promena}}`
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
	})
</script>
```

```
I ❤️ Brackets!
```

## Šablony

## Cache
Pomocí cache šablon je možné snížit dobu a náročnost překreslování obsahu. Stačí uvést parametr `cacheKey`, zkompilovaná šablona se uloží a bude připravena na další použití.
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
	})
</script>
```

## Události
Před vyrenderováním se volá metoda `beforeRender`. Po vyrenderování je zavolána metoda `afterRender`. Tyto metody mohou sloužit k úpravě parametrů před renderováním a dalším akcím po vykreslení obsahu.
Do těchto dvou metod je předán celý konfigurační objekt.

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
			alert("Vygenerované číslo je " + this.data.number);
		}
	});
</script>
```

## Makra
V základu jsou k dispozici následující makra.

|                       Podmínky                       |                                                  |
|:----------------------------------------------------:|:------------------------------------------------:|
| {{if $cond}} … {{elseif $cond}} … {{else}} … {{/if}} | Podmínka if                                      |

|                         Cykly                        |                                                  |
|:----------------------------------------------------:|:------------------------------------------------:|
| {{for podmínka} … {/for}                             | Cyklus for                                       |
| {{while podmínka}} … {/while}                        | Cyklus while                                     |
| {{continueIf podmínka}}                              | Podmíněný skok na další iteraci                  |
| {{breakIf podmínka}}                                 | Podmíněné ukončení cyklu                         |

|                       Proměnné                       |                                                  |
|:----------------------------------------------------:|:------------------------------------------------:|
| {{var foo = value}}                                  | Vytvoří proměnnou                                |

|                        Ostatní                       |                                                  |
|:----------------------------------------------------:|:------------------------------------------------:|
| {{dump promena}}                                     | Vypíše proměnnou do konzole (obdoba console.log) |
| {{js kod}}                                           | Umožňuje vložit čistý javascript                 |

### Vytvoření vlastního makra
Makro v pojetí šablonovacího systému je spustitelný kód.
Nejdříve si vytvoříme jednoduché makro s využítím pouhého textu. Makro se bude jmenovat *alert* a parametr bude *cislo*. Makro se dělí na 2 části `{{nazev parametry}}`.
`#0` je označení tokenu pro obsah. Tedy v našem případě to bude nahrazení proměnné číslo za 1.

```html
<div id="app">
	{{alert cislo}}
</div>
<script>
	Brackets
	    .addMacro('alert', 'alert(#0);')
        .render({
            el: '#app',
            data: {
                cislo: 1
            }
        });
</script>
```

Makro může být i ve formě funkce. V dalším příkladu si ukážeme práci s proměnnou `_template`, do které se celá šablona generuje.
Tuto proměnnou použijeme v případě, že chceme z makra vracet nějaký obsah.
Uvnitř kompilace se text odděluje pomocí [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) nebo jednoduchými uvozovkami (dle podpory prohlížeče).
Správný separator se po inicializaci šablonovacího systému uloží do proměnné `Brackets.templateLiteral`.
Je dobré tuto proměnnou využívat. Snížíte tak riziko nekompatibility se staršími prohlížeči.
Na konci makra je vždy nutné uvést středník, který odděluje vygenerovaný kód. V případě, že středník neuvedete, kompilace skončí chybou.

```html
<div id="app">
	{{vypisCislo cislo}}
</div>
<script>
	var sep = Brackets.templateLiteral;
	Brackets
	    .addMacro('vypisCislo', function () {
    		return '_template +=' + sep + 'Číslo: ' +  sep + ' + cislo;'
    	})
        .render({
            el: '#app',
            data: {
                cislo: 1
            }
        });
</script>
```

```
Číslo: 1
```

## Filtry
Filtry slouží k úpravě vypisovaných proměnných.
Jako první příklad si uvedeme vytvoření filtru `firstToUpper`, který nám převede první znak textu na velké písmeno.

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

Filtrům je možné předávat libovolný počet argumentů. Argumenty se přidávají za dvojtečku a jsou oddělené čárkou.
Příklad níže nám vrátí výchozí text *první* a připojí k tomu text `druhý` a `třetí`.

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
                text: 'První'
            }
        });
</script>
```

```
První, druhý, třetí
```