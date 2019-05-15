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
export function hasOwnProperty(object, prop) {
    return ({}).hasOwnProperty.call(object, prop);
}

/**
 * 封装Object.keys方法
 *
 * @param  {Object} object
 * @return {Array}
 */
export function keys(object) {
    return isObject(object) ? Object.keys(object) : [];
}

/**
 * 遍历对象可枚举属性
 *
 * @param  {Object} object
 * @param  {Function} fn
 */
export function each(object, fn) {
    keys(object).forEach(key => fn(object[key], key));
}

/**
 * Array-like reduce for objects.
 *
 * @param  {Object} object
 * @param  {Function} fn
 * @param  {Mixed} [initial = 0]
 * @return {Mixed}
 */
export function reduce(object, fn, initial = 0) {
    return keys(object).reduce((accum, key) => fn(accum, object[key], key), initial);
}

/**
 * Object.assign-style object shallow merge/extend.
 *
 * @param  {Object} target
 * @param  {Object} ...objects
 * @return {Object}
 */

export function assign(target, ...objects) {
    if (Object.assign) {
        Object.assign(target, ...objects);
    }

    objects.reduce((accum, object) => {
        if (!isPlain(object)) {
            return;
        }

        each(object, (value, key) => {
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
export function isObject(value) {
    return !!value && typeof value === 'object';
}

/**
 * Returns whether an object appears to be a "plain" object - that is, a
 * direct instance of `Object`.
 *
 * @param  {Object} value
 * @return {boolean}
 */
export function isPlain(value) {
    return isObject(value)
        && toString.call(value) === '[object Object]'
        && value.constructor === Object;
}
