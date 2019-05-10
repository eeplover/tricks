/**
 * @file   fn.js 
 * @author eeplover@gmail.com
 */

Function.prototype.bind = function (thisArg) {
    return function (...args) {
        fn.call(thisArg, ...args);
    }
};

function throttle(params) {
    
}

function debounce(params) {
    
}
