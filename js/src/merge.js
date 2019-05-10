/**
 * @file   merge.js 合并对象
 * @author eeplover@gmail.com
 */
import {isPlain, each} from './utils/obj'


/**
 * Merge two objects recursively.
 *
 * Only merge plain objects(not array, element, anything else).
 *
 * @param  {Object} object
 * @param  {Object} [...sources]
 * @return {Object}
 */
function merge(object, ...sources) {
    sources.reduce((accum, source) => {
        // only plain obj
        if (!isPlain(source)) {
            return;
        }

        each(source, (value, key) => {
            if (isPlain(value)) {
                if (!isPlain(accum[key])) {
                    accum[key] = {};
                }
                accum[key] = merge(accum[key], value);
            }
            else {
                accum[key] = value;
            }
        });
    }, object);

    return object;
}

export default merge;
