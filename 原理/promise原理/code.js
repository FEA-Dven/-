function Mypromise(fn) {
    var value = null;
    // callbacks为数组，因为可能同时有很多个回调
    callbacks = [];
    this.then = function (onFulfilled) {
        callbacks.push(onFulfilled);
    }

    function resolve(value) {
        callbacks.forEach(function (callbacks) {
            callbacks(value);
        })
    }

    fn(resolve);
}

function add(x, y) {
    return x + y;
}

Mypromise(add())