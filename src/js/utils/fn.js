/**
 * @file   fn.js 
 * @author eeplover@gmail.com
 */

/**
 * 防反跳函数
 *
 * 用于click，input，mouseover等事件的调用优化
 *
 * @param  {Function} fn
 * @param  {Number} delay
 * @param  {Boolean} immediate
 * @return {Function}
 */
export function debounce(fn, delay = 0, immediate = true) {
    if (typeof fn !== 'function') {
        throw new TypeError('Respected a function.');
    }

    let timeoutId = 0;
    const cbk = function (context, ...args) {
        timeoutId = 0;
        if (context) {
            fn.call(context, ...args);
        }
    };
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (immediate) {
            let callNow = !timeoutId;
            timeoutId = setTimeout(cbk, delay);
            if (callNow) {
                cbk(this, ...args);
            }
        }
        else {
            timeoutId = setTimeout(cbk, delay, this, ...args);
        }
    };
}

/**
 * 节流函数
 *
 * 适用于scroll，resize，touchmove等事件的调用优化
 *
 * @param  {Function} fn
 * @param  {Number} delay
 * @return {Function}
 */
export function throttle(fn, delay = 0) {
    if (typeof fn !== 'function') {
        throw new TypeError('Respected a function.');
    }

    let lastTime = 0;
    let timeoutId;
    return function (...args) {
        const now = Date.now();
        const remaining = delay - (now - lastTime);

        lastTime = now;
        if (lastTime && remaining > 0) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                fn.call(this, ...args);
            }, remaining);
        }
        else {
            fn.call(this, ...args);
        }
    };
}
