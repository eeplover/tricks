/**
 * @file   clone.js 对象拷贝方法
 * @author eeplover@gmail.com
 */

import {isPlain, isObject, hasOwnProperty, keys} from './utils/obj';
import cache from './utils/cache';
import {throwErr} from './utils/err';

/**
 * 利用JSON巧妙实现
 *
 * @param    {Object} object
 * @return   {Object}
 */
function cloneByJson(object) {
    if (!isPlain(object)) {
        throwErr('参数错误');
    }
    return JSON.parse(JSON.stringify(object));
}

/**
 * 递归式深拷贝
 *
 * @param  {Object} object
 * @return {Object}
 */
function cloneByRecursion(object, ) {
    if (!isPlain(object)) {
        throwErr('参数错误');
    }

    let result = {};
    // 只遍历可枚举属性
    each(object, (value, key) => {
        // 过滤继承而来的可枚举属性
        if (hasOwnProperty(object, key)) {
            if (isPlain(value)) {
                result[key] = cloneByRecursion(value);
            }
            else if (Array.isArray(value)) {
                // @TODO 这里只简单处理Array的情况
                result[key] = [];
                value.forEach(item => {
                    let v = isObject(item) ? JSON.parse(JSON.stringify(item)) : item;
                    result[key].push(v);
                });
            }
            else {
                result[key] = value;
            }
        }
    });

    return result;
}

/**
 * 遍历式深拷贝
 *
 * @param  {Object} object
 * @return {Object}
 */
function cloneByTraversal(object) {
    if (!isPlain(object)) {
        throwErr('参数错误');
    }

    const root = {};
    const stack = [
        {
            parent: root,
            key: undefined,
            data: object
        }
    ];

    while (stack.length) {
        const node = stack.pop();
        const parent = node.parent;
        const key = node.key;
        const data = node.data;
        let attachedNode = parent;


        if (key !== undefined) {
            attachedNode = parent[key] = {};
        }

        cache.store({
            source: data,
            target: attachedNode
        });
        each(data, (value, key) => {
            if (hasOwnProperty(object, key)) {
                if (isPlain(value)) {
                    let cachedValue = null;
                    cache.forEach(item => {
                        if (item.source === value) {
                            cachedValue = item;
                        }
                    });
                    stack.push({
                        parent: attachedNode[key],
                        key: key,
                        data: cachedValue ? cachedValue.target : value
                    });
                }
                else if (Array.isArray(value)) {
                    // @TODO 这里只简单处理Array的情况
                    attachedNode[key] = [];
                    value.forEach(item => {
                        let v = isObject(item) ? JSON.parse(JSON.stringify(item)) : item;
                        attachedNode[key].push(v);
                    });
                }
                else {
                    attachedNode[key] = value;
                }
            }
        });
    }

    return root;
}