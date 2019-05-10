/**
 * @file   cache.js 缓存
 * @author eeplover@gmail.com
 */
import {each, hasOwnproperty} from './obj';
export default const cache = {
    count： 0,
    db: {},
    store(value) {
        const key = 'chacheKey' + this.count;
        db[key] = value;
        return key;
    },
    get(key) {
        return this.db[key] !== undefined ? this.db[key] : false;
    },
    has(value) {
        let result = false;
        const db = this.db;
        each(db, (v, key) => {
            if (hasOwnproperty(db, key) && value === v) {
                result = true;
                break;
            }
        });

        return result;
    },
    forEach(cbk) {
        each(this.db, cbk);
    }
};