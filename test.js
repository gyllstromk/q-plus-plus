/* jshint expr:true */

require('./');

var q              = require('q'),
    chai           = require("chai"),
    chaiAsPromised = require("chai-as-promised");
    expect         = chai.expect;

chai.should();
chai.use(chaiAsPromised);


describe('q-flow', function () {
    describe('each', function () {
        it('works with promises', function () {
            var sum = 0;

            return q.each([1, 2, 3], function (each) {
                sum += each;
                return q.when(each);
            }).then(function (value) {
                expect(value).to.be.undefined;
                expect(sum).to.equal(6);
            }).should.be.fulfilled;
        });

        it('works without promises', function () {
            var sum = 0;

            return q.each([1, 2, 3], function (each) {
                sum += each;
                return each;
            }).then(function (value) {
                expect(value).to.be.undefined;
                expect(sum).to.equal(6);
            }).should.be.fulfilled;
        });

        it('works without return', function () {
            var sum = 0;

            return q.each([1, 2, 3], function (each) {
                sum += each;
            }).then(function (value) {
                expect(value).to.be.undefined;
                expect(sum).to.equal(6);
            }).should.be.fulfilled;
        });
    });

    describe('map', function () {
        it('works with promises', function () {
            return q.map([1, 2, 3], function (each) {
                return q.when(each + 1);
            }).should.eventually.deep.equal([2, 3, 4]);
        });

        it('works without promises', function () {
            return q.map([1, 2, 3], function (each) {
                return each + 1;
            }).should.eventually.deep.equal([2, 3, 4]);
        });
    });

    describe('until', function() {
        it('works', function () {
            var attempt = 0;
            return q.until(function () {
                return q.fcall(function () {
                    return ++attempt > 3;
                });
            }).then(function () {
                expect(attempt).to.equal(4);
            }).should.be.fulfilled;
        });

        it('passes if we do less than max tries', function () {
            var attempt = 0;
            return q.until(function () {
                return q.fcall(function () {
                    return ++attempt > 3;
                });
            }, undefined, 4).should.be.fulfilled;
        });

        it('throws an exception if we do more than max tries', function () {
            var attempt = 0;
            return q.until(function () {
                return q.fcall(function () {
                    return ++attempt > 3;
                });
            }, undefined, 3).should.be.rejected;
        });

        it('waits if we set a delay', function () {
            var attempt = 0;
            var start = new Date();

            return q.until(function () {
                return q.fcall(function () {
                    return ++attempt > 3;
                });
            }, 100).then(function () {
                var end = new Date();
                var elapse = end - start;
                expect(elapse).to.be.above(200);
                expect(elapse).to.be.below(400);
            }).should.be.fulfilled;
        });
    });

    describe('find', function () {
        describe('with promise', function () {
            var fn = function (each) {
                return q.fcall(function () {
                    return each >= 3;
                });
            };

            it('returns first match', function () {
                return q.find([1, 2, 3, 4, 5], fn)
                    .should.eventually.deep.equal(3);
            })

            it('results undefined if nothing matches', function () {
                return q.find([1, 1, 1, 1, 1], fn)
                    .should.eventually.be.undefined;
            });
        });

        describe('without promise', function () {
            var fn = function (each) {
                return each >= 3;
            };

            it('returns first match', function () {
                return q.find([1, 2, 3, 4, 5], fn)
                    .should.eventually.deep.equal(3);
            })

            it('results undefined if nothing matches', function () {
                return q.find([1, 1, 1, 1, 1], fn)
                    .should.eventually.be.undefined;
            });
        });
    });

    describe('addBack', function () {
        it('passes result on success', function (done) {
            return q.when('test').addBack(function (err, result) {
                expect(err).to.be.null;
                expect(result).to.equal('test');
                done();
            });
        });

        it('passes error on failure', function (done) {
            var error = new Error();

            return q.fcall(function () {
                throw error;
            }).addBack(function (err, result) {
                expect(err).to.equal(error);
                done();
            });
        });
    });
});
