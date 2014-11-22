var q = require('q');

/**
 * Call `fn`, which returns a promise, on each item in `array`.
 */
q.each = function (array, fn) {
    return array.reduce(function (promise, each) {
        return promise.then(function () {
            return fn(each);
        });
    }, q()).then(function () {
        // mask last value
    });
};

/**
 * Call `fn`, which returns a promise, on each item in `array`, returning new
 * array.
 */
q.map = function (array, fn) {
    var mappedArray = [];
    return q.each(array, function (each) {
        var result =  fn(each);
        if (result && result.then) {
            return result.then(function (item) {
                mappedArray.push(item);
            });
        } else {
            mappedArray.push(result);
            return result;
        }
    }, q()).then(function () {
        return mappedArray;
    });
};

var find = function (array, fn, current) {
    return q.until(function () {
        var result =  fn(array[current]);
        if (!result || !result.then) {
            result = q(result);
        }

        return result.then(function (result) {
            if (result) {
                return array[current];
            }

            current += 1;
            if (current >= array.length) {
                return true; // break the loop
            }
        });
    });
};

/**
 * Find first object in `array` satisfying the condition returned by the
 * promise returned by `fn`.
 */
q.find = function (array, fn) {
    return find(array, fn, 0).then(function (result) {
        if (result === true) {
            return undefined;
        }

        return result;
    });
};

/**
 * Loop until the promise returned by `fn` returns a truthy value.
 */
q.until = function (fn, delay, max, tries) {
    if (tries === undefined) {
        tries = 0;
    }

    if (max !== undefined && tries >= max) {
        throw new Error("timeout");
    }

    return fn().then(function (result) {
        if (result) {
            return result;
        }

        if (delay) {
            return q.delay(delay).then(function () {
                return q.until(fn, delay, max, tries + 1);
            });
        } else {
            return q.until(fn, undefined, max, tries + 1);
        }
    });
};

/**
 * Allow one to place node-styled callback onto promise. This exits the promise
 * run-loop so that it no longer catches exceptions.
 */
q.makePromise.prototype.addBack = function (callback) {
    return this.then(function (result) {
        process.nextTick(function () {
            callback(null, result);
        });
    }, function (err) {
        process.nextTick(function () {
            callback(err);
        });
    });
};
