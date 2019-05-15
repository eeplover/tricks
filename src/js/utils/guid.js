/**
 * @file   guid.js 唯一id生成器
 * @author eeplover@gmail.com
 */

let _guid = 1;

export function guid(prefix = '') {
    return prefix + _guid++;
}
