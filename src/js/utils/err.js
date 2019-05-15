/**
 * @file   err.js 标准化异常处理
 * @author eeplover@gmail.com
 */

/**
 * 标准化异常抛出
 *
 * @param {String} message
 * @param {Number} code
 */

export function throwErr(message) {
    throw new Error(message);
}