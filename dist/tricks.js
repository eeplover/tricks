function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

/**
 * @file   obj.js 针对对象封装的一些常用方法
 * @author eeplover@gmail.com
 */

/**
 * 避免对象自定义了hasOwnProperty方法导致错误
 *
 * var foo = {
 *     hasOwnProperty: function() {
 *         return false;
 *     },
 *     bar: 'Here be dragons'
 * };
 * 
 * foo.hasOwnProperty('bar'); // 始终返回 false
 *
 * @param  {Object} object
 * @param  {String} prop
 * @return {Boolean}
 */
function hasOwnProperty(object, prop) {
  return {}.hasOwnProperty.call(object, prop);
}
/**
 * 封装Object.keys方法
 *
 * @param  {Object} object
 * @return {Array}
 */

function keys(object) {
  return isObject(object) ? Object.keys(object) : [];
}
/**
 * 遍历对象可枚举属性
 *
 * @param  {Object} object
 * @param  {Function} fn
 */

function each(object, fn) {
  keys(object).forEach(function (key) {
    return fn(object[key], key);
  });
}
/**
 * Array-like reduce for objects.
 *
 * @param  {Object} object
 * @param  {Function} fn
 * @param  {Mixed} [initial = 0]
 * @return {Mixed}
 */

function reduce(object, fn) {
  var initial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return keys(object).reduce(function (accum, key) {
    return fn(accum, object[key], key);
  }, initial);
}
/**
 * Object.assign-style object shallow merge/extend.
 *
 * @param  {Object} target
 * @param  {Object} ...objects
 * @return {Object}
 */

function assign(target) {
  for (var _len = arguments.length, objects = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    objects[_key - 1] = arguments[_key];
  }

  if (Object.assign) {
    Object.assign.apply(Object, [target].concat(objects));
  }

  objects.reduce(function (accum, object) {
    if (!isPlain(object)) {
      return;
    }

    each(object, function (value, key) {
      accum[key] = value;
    });
  }, target);
  return target;
}
/**
 * Returns whether a value is an object of any kind - including DOM nodes,
 * arrays, regular expressions, etc. Not functions, though.
 *
 * This avoids the gotcha where using `typeof` on a `null` value
 * results in `'object'`.
 *
 * @param  {Object} value
 * @return {boolean}
 */

function isObject(value) {
  return !!value && _typeof(value) === 'object';
}
/**
 * Returns whether an object appears to be a "plain" object - that is, a
 * direct instance of `Object`.
 *
 * @param  {Object} value
 * @return {boolean}
 */

function isPlain(value) {
  return isObject(value) && toString.call(value) === '[object Object]' && value.constructor === Object;
}

export { assign, each, hasOwnProperty, isObject, isPlain, keys, reduce };
