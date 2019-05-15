var assert = require('assert');
var obj = require('../dist/tricks.cjs.js');

describe('isPlain', function() {
    describe('#isPlain([])', function() {
        it('should return false when pass []', function() {
        assert.equal(obj.isPlain([]), false);
        });
    });
});
