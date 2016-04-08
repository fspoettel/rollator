
/* ! rollator v0.2.1
 * https://github.com/fspoettel/rollator.js
 * Copyright (c) 2016 Felix Spöttel; Released under the MIT License
 */

'use strict';

/*
 * Import dependencies & polyfill Object.assign
 */

import 'core-js/fn/Object/assign';

import classes from 'component-classes';
import emitter from 'component-emitter';
import forEach from 'lodash.foreach';
import isString from 'lodash.isstring';

/*
 * Private Variables & Functions
 */

// Log a decorated warning
// @returns x-offset
const _warn = (msg) => {
  console.warn(`✨ rollator.js ✨ ${msg}`); // eslint-disable-line no-console
};

// Get x-offset
// @returns x-offset
const _getX = ($node) => {
  let offset = 0;
  if ($node !== null) {
    const bounds = $node.getBoundingClientRect();
    offset = bounds.left;
  }
  return offset;
};

// Create a DOM-Node from a string
// TODO: Use DOMParser once it is better supported
// @returns node
const _toDOM = (str) => {
  const frag = document.createDocumentFragment();
  const tmp = document.createElement('div');
  tmp.innerHTML = str;
  const children = tmp.children;

  for (let i = 0; i < children.length; i++) {
    frag.appendChild(children[i]);
  }

  return frag;
};

/*
 * Main Class
 * TODO: Add Unit Tests
 */

const Rollator = function Rollator(el, opts) {
  this.container = el || '.rltr';
  this.instances = [];

  const defaults = {
    caseSensitive: false,
    verticalOn: 0
  };
  this.opts = Object.assign({}, defaults, opts);
};

emitter(Rollator.prototype);

/*
 * Public Interface
 */

// Initialize the plugin
// @returns state-context
Rollator.prototype.init = function init() {
  const $instances = document.querySelectorAll(this.container);

  if ($instances.length <= 0) {
    _warn(`${this.container} does not exist on page, but init() was called on it.`);
    return null;
  }

  forEach($instances, ($instance) => {
    const instance = {};
    instance.letters = this._read($instance);

    const isEmpty = instance.letters.length <= 0;

    if (isEmpty) {
      _warn(`Container ${this.container} is empty`);
    } else {
      forEach(instance.letters, (letter) => {
        this._transform(letter);
        this._bind(letter);
      });

      instance.resizeListener = this._onResize.bind(this, instance);
      instance.resizeTimer = null;
      instance.isResizing = false;

      window.addEventListener('resize', instance.resizeListener);

      this.instances.push(instance);
    }
  });

  this.emit('init');

  return this;
};

// Destroy the plugin
// @returns state-context
Rollator.prototype.destroy = function destroy() {
  forEach(this.instances, (instance) => {
    forEach(instance.letters, (letter) => {
      this._unbind(letter);
      this._removeTransform(letter);
    });
    window.removeEventListener('resize', instance.resizeListener);
  });

  this.emit('destroy');
};

/*
 * Event Binds & Event Handlers
 */

// Bind a hover to a letter
Rollator.prototype._bind = function _bind(_letter) {
  const letter = _letter;

  letter.onMouseEnter = this._onMouseEnter.bind(this);
  letter.onMouseLeave = this._onMouseLeave.bind(this);

  letter.context.addEventListener('mouseenter', letter.onMouseEnter);
  letter.context.addEventListener('mouseleave', letter.onMouseLeave);
};

// Unbind hovers from a letter
Rollator.prototype._unbind = function _unbind(letter) {
  letter.context.removeEventListener('mouseenter', letter.onMouseEnter);
  letter.context.removeEventListener('mouseleave', letter.onMouseLeave);
};

// Resize Callback
Rollator.prototype._onResize = function _onResize(_instance) {
  const instance = _instance;
  // Remove transforms when starting to resize
  if (!instance.isResizing) {
    forEach(instance.letters, (letter) => {
      this._removeTransform(letter);
    });
    instance.isResizing = true;
  }
  // Set transforms once resizing has stopped
  clearTimeout(instance.resizeTimer);
  instance.resizeTimer = setTimeout(() => {
    forEach(instance.letters, (letter) => {
      this._transform(letter);
    });
    instance.isResizing = false;
  }, 200);
};

// Mouseenter Callback
// TODO: Maybe use closest() to find container instead of parentNode
Rollator.prototype._onMouseEnter = function _onMouseEnter(e) {
  classes(e.currentTarget).add('is-active');
  classes(e.currentTarget.parentNode).add('is-hovered');
  this.emit('mouseenter', e.currentTarget);
};

// Mouseleave callback
// TODO: Maybe use closest() to find container instead of parentNode
Rollator.prototype._onMouseLeave = function _onMouseLeave(e) {
  classes(e.currentTarget).remove('is-active');
  classes(e.currentTarget.parentNode).remove('is-hovered');
  this.emit('mouseleave', e.currentTarget);
};

/*
 * String Methods
 */

// Get the offset of a character in a string relative to its parent
// @returns x-offset
Rollator.prototype._getRelativeX = function _getRelativeX(letter, disable) {
  const nameW = letter.value.offsetWidth;
  const clientW = window.innerWidth;
  const contextX = _getX(letter.context);
  const charX = _getX(letter.char);

  return this._calculateOffsetX(contextX, charX, nameW, clientW, disable);
};

// Calculates the offset of a character in a string relative to its parent
// @returns x-offset
Rollator.prototype._calculateOffsetX = (contextX, charX, nameW, clientW, disable) => {
  const diff = charX - contextX;

  let px = diff;

  // Check if the name overflows the viewport on the left
  const l = (contextX - diff) <= 0;
  // Check if the name overflows the viewport on the right
  const r = nameW >= clientW || (charX - diff + nameW) >= clientW;
  // Check if the name overflows the viewport on the right if set to 0
  const rr = r && (charX + nameW) >= clientW;

  // if left not poss. and right poss., overlay
  if (l && !rr) {
    px = 0;
  }

  // if left not poss. and right not poss., overlay
  if (l && r || r && rr || clientW <= disable) {
    px = null;
  }

  return px;
};

// Match a substring in a string
// @returns { start, end } || false
Rollator.prototype._match = (string, subString, caseSensitive = false) => {
  const str = caseSensitive ? string : string.toLowerCase();
  const subStr = caseSensitive ? subString : subString.toLowerCase();

  if (isString(str) && isString(subStr) && str.includes(subStr)) {
    const start = str.indexOf(subStr);
    const end = start + subStr.length;
    return { start, end };
  }
  return false;
};

// Slice a string according to substring-position
// @returns { substring-index, strings }
Rollator.prototype._slice = (str, position) => {
  let index = position ? 0 : false;
  const strings = [];
  const length = str.length;

  if (index === false) {
    strings.push(str);
  } else {
    if (position.start > 0) {
      strings.push(str.slice(0, position.start));
      index = 1;
    }

    strings.push(str.slice(position.start, position.end));

    if (position.end < length) {
      strings.push(str.slice(position.end, length));
    }
  }

  return { index, strings };
};

// Wrap strings in a template
// @returns [strings]
Rollator.prototype._wrap = (strObj) => {
  const strings = [];

  forEach(strObj.strings, (string, i) => {
    // vertical mode needs block-spaces
    const str = string.split(' ').join('&nbsp;');
    let attr = '';

    if (strObj.index === false) {
      attr = ' data-rltr="nomatch"';
    } else {
      attr = i === strObj.index ? ' data-rltr="match"' : '';
    }

    strings.push(`<span${attr}>${str}</span>`);
  });
  return strings;
};

// Render strings into DOM-Node
// @returns DOM-Node with target
Rollator.prototype._render = function _render($node, strings) {
  forEach(strings, (string) => {
    $node.appendChild(_toDOM(string));
  });
  return $node.querySelector('[data-rltr="match"]');
};

/*
 * DOM Methods
 */

 // Read initial state from DOM
 // @returns letter-array
Rollator.prototype._read = function _read($container) {
  const letters = [];
  const $letters = $container.querySelectorAll('.rltr-group');

  forEach($letters, ($letter) => {
    const letter = {
      context: $letter,
      anchor: $letter.querySelector('.rltr-group_anchor'),
      value: $letter.querySelector('.rltr-group_value'),
    };

    if (letter.value === null || letter.anchor === null) {
      _warn(`Found a letter in ${this.container} with missing anchor/value-pair.`);
      return;
    }

    const str = this._readText(letter.value, true);
    const target = this._readText(letter.anchor, false);

    const strPosition = this._match(str, target);
    const strSlices = this._slice(str, strPosition);
    const $wrappedStrings = this._wrap(strSlices);

    letter.char = this._render(letter.value, $wrappedStrings);
    letters.push(letter);
  });

  return letters;
};

// Read the text from a node
// @returns textContent
Rollator.prototype._readText = function _readText(_$node, del = false) {
  const $node = _$node;
  const textContent = $node.textContent;

  if (del) {
    $node.innerHTML = '';
  }

  return textContent;
};

// Apply a transform to a letter
Rollator.prototype._transform = function _transform(letter) {
  const offset = this._getRelativeX(letter, this.opts.verticalOn);
  const $value = letter.value;

  if (offset !== null) {
    $value.style.left = `-${offset}px`;

    if (offset === 0) {
      classes(letter.context).add('is-nulled');
    }
  } else {
    classes(letter.context).add('is-vertical');
  }
};

// Remove all transforms
Rollator.prototype._removeTransform = function _removeTransform(letter) {
  const $ctx = letter.context;
  const $value = letter.value;

  $value.style.left = '';

  if (classes($ctx).has('is-active')) {
    classes($ctx).remove('is-active');
  }

  if (classes($ctx).has('is-nulled')) {
    classes($ctx).remove('is-nulled');
  }

  if (classes($ctx).has('is-vertical')) {
    classes($ctx).remove('is-vertical');
  }
};

export default Rollator;
