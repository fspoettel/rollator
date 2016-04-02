# rollator

> Making strings roll again

[**Demo** ](https://felics.me/rollatorjs)

rollator makes it easy to overlay a string on top of another string on mouseover. If both strings share letters, rollator will align and highlight them. Rollator handles resizing-logic for you, so you will never have to worry about text overflowing the visible viewport.

## Install

```bash
npm install rollator
```

## Use

### Initialize

```js
import Rollator from 'rollator';

const rollator = new Rollator(el, opts);

rollator.init();
rollator.destroy();
```
To initialize the library, simply require it from npm and init() it.


```html
<h1 class="rltr">
  <span class="rltr-group">
    <span class="rltr-group_anchor">roll</span>
    <span class="rltr-group_value">rollator</span>
  </span>
</h1>
```
Tagnames are flexible, but please make sure the classes are following the pattern outlined in this example.

```css
.rltr {
  position: relative;
  display: inline-block; }

.rltr-group {
  position: relative;
  display: inline-block;
  cursor: pointer; }

.rltr-group_value {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  visibility: hidden;
  text-align: center;
  white-space: nowrap; }

.rltr.is-hovered .rltr-group_anchor {
  visibility: hidden; }

.rltr-group.is-active > .rltr-group_value {
  visibility: visible; }

.rltr-group.is-horizontal > .rltr-group_value {
  display: inline-block;
  top: 100%;
  left: 50%;
  font-size: 0.5em;
  pointer-events: all;
  -webkit-transform: translateX(-50%);
          transform: translateX(-50%);
  white-space: normal;
  -ms-writing-mode: tb-lr;
  -webkit-writing-mode: vertical-lr;
          writing-mode: vertical-lr; }

.rltr-group.is-horizontal.is-active > .rltr-group_anchor {
  visibility: visible; }
```
The CSS in `/lib` is compiled from `src/index.scss` which holds a couple of core styles and a default theme. The core CSS is outlined above. It is recommended to import `lib/rollator.css` or `src/index.scss` into your build system.
To use the default-theme, add `.rltr--default` to your container. You can configure some aspects of the plugin / default-theme in the SCSS-File.

### API

`new Rollator(el, options)`

 - **el**: Selector to bind the behavior to. (Default: '.rltr')
 - **options**: Behavior configuration (see below for options)

`rollator.init()` Initializes rollator-instances for all matching elements for a given behavior

`rollator.destroy()` Destroys all rollator-instances for a given behavior and unbinds all event-listeners

### Config

 - `horizontalOn: 0` px-value that determines when the plugin should fall back to an all-horizontal display-mode
 - `caseSensitive: false` determines if string-matching should take letter-case into consideration

### Webfonts

```js
import 'core-js/es6/promise';
import FontFaceObserver from 'fontfaceobserver';
import Rollator from 'rollator';


function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


ready(() => {
  const lato300 = new FontFaceObserver('Lato', {
    weight: 300
  });

  const lato700 = new FontFaceObserver('Lato', {
    weight: 700
  });

  const rollator = new Rollator();

  Promise.all([lato300, lato700]).then(() => {
    rollator.init();
  });
});
```
Webfonts can take a while to load and change the dimensions of your text. Therefore, it is recommended to wait for them to finish loading before calling `rollator.init()`. The example above shows how to do this in a future-proof way. (The polyfills for promises / FontFaceObserver can be removed once there is enough native browser-support for those features)

### Caveats / TODO
 - Rollator replaces normal spaces with `&nbsp;`-spaces to make the horizontal-mode work.
 - TODO: Unit Tests are not written yet.
 - TODO: Link handling on touch devices
