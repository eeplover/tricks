
if (!Function.prototype.bind) {
    Function.prototype.bind = function () {
        if (typeof this !== 'function') {
            throw new Error('Bind target is not a function');
        }

        var that = this;
        var args = Array.prototype.slice.call(arguments, 0);
        var argThis = args.shift();
        var fn = function () {
            args = args.concat(Array.prototype.slice.call(arguments, 0));
            that.apply(this instanceof fn ? this : argThis, args);
        };

        if (this.prototype) {
            fn.prototype = this.prototype;
        }

        return fn;
    };
}
