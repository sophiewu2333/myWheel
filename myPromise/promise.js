class myPromise{
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        let resolve = value => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        };
        let reject = reason => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };
        try {
            executor(resolve, reject);
        } catch(err) {
            reject(err);
        }
    }
    then(onFulfilled, onRejected) {
      let promise2 = new myPromise((resolve, reject) => {
        if (this.state === 'fulfilled') {
            // onFulfilled(this.value);
            setTimeout(() => {
                try {
                   let x = onFulfilled(this.value);
                   resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e)
                }
            },0 );
        }
        if (this.state === 'rejected') {
            // onRejected(this.reason);
            setTimeout(() => {
                try {
                    let x = onRejected(this.reason);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e)
                }
            },0 );
        }
        if (this.state === 'pending') {
            this.onResolvedCallbacks.push(() => {
                // this.onFulfilled(this.value);
                setTimeout(() => {
                    try {
                       let x = onFulfilled(this.value);
                       resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e)
                    }
                },0 );
            });
            this.onRejectedCallbacks.push(() => {
                // this.onRejected(this.reason);
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e)
                    }
                },0 );
            });
        }
      });
      return promise2;
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    if (x === promise2) {
        return reject(new Error('Chanining cycle detected for promise'));
    }
    let called;
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, err => {
                    if (called) return;
                    called = true;
                    reject(err)
                });
            } else {
                resolve(x);
            }
        } catch(e) {
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}

let promise = new myPromise((resolve, reject) => {
  resolve('success');
  console.log('after resolve');
  reject('error');
});
promise.then(result => {
    console.log(result);
}).then(result => {
    console.log(result)
});
Promise.defer = Promise.deferred = function () {
    let dfd = {}
    dfd.promise = new Promise((resolve,reject)=>{
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
module.exports = Promise;

