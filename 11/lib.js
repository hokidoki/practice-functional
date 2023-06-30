class Product {
    constructor(name, price) {
        this.name = name;
        this.price = price
    }
}

const products = [
    new Product("옷", 5000),
    new Product("바지", 4000),
    new Product("속옷", 4500),
    new Product("모자", 3000),
    new Product("양말", 2000),
]
const L = {} //lazy namespace;
const go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);
const go = (...args) => reduce((acc, f) => f(acc), args)
const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);
const curry = (f) => (arg, ..._) => _.length ? f(arg, ..._) : (...args) => f(arg, ...args);

// 
const join = curry((sep = ",", iter) => reduce((a, b) => a + sep + b, iter))
const isIterable = (v) => v && v[Symbol.iterator]
const nop = Symbol("nop");

L.flattern = function* (iter) {
    for (a of iter) {
        if (isIterable(a)) yield* a
        else yield a
    }
}

L.deepFlattern = function* (iter) {
    for (a of iter) {
        if (isIterable(a)) yield* L.deepFlattern(a)
        else yield a
    }
}

L.entries = function* (obj) {
    for (k in obj) yield [k, obj[k]]
}
L.range = function* (l) {

    let i = -1;
    while (++i < l) yield i
}
L.map = curry(function* (f, iter) {
    for (a of iter) yield go1(a, f)
})
L.filter = curry(function* (f, iter) {
    // 아주 독특한점 발견 cosnt a를 명시하지 않으니, b.then의 콜백이 실행되는 시점에서는 a가 스코프를 유지 하지 않음
    // 아마 a를 global.a로 인식하는 듯 하다.
    for (const a of iter) {
        const b = go1(a, f);
        // take와 reduce에서 nop을 처리 할 수 있도록 해야함
        if (b instanceof Promise) yield b.then(b => b ? a : Promise.reject(nop))
        else if (b) yield a
    }
})

const timeTest = (name, time, f) => {
    console.time(name)
    while (time-- >= 0) f()
    console.timeEnd(name)
}

// const take = curry(function take(l, iter) {
//     const res = [];
//     iter = iter[Symbol.iterator]();

//     for (const a of iter) {
//         if (res.length < l) res.push(a);
//         else return res;
//     }
//     return res;
// })


// take can handle Promise
const take = curry(function take(l, iter) {
    const res = [];

    iter = iter[Symbol.iterator]();

    return function recur() {
        let cur;
        while (!(cur = iter.next()).done) {
            const a = cur.value;
            // Promise를 계속해서 return함 결국 a.then(f).then(f)형태로 되는건 동일함
            if (a instanceof Promise) return a.then(a => (res.push(a), res.length === l ? res : recur())).catch(e => e === nop ? recur() : Promise.reject(e))

            res.push(a)
            if (res.length === l) return res
        }
        return res
    }()
})

const queryString = pipe(
    L.entries,
    L.map(([k, v]) => `${k}=${v}`),
    join("&")
)
const find = curry(pipe(
    L.filter,
    take(1),
    ([a]) => a
))
const takeAll = take(Infinity);
const map = curry(pipe(
    L.map,
    takeAll
))
const flattern = pipe(
    L.flattern,
    takeAll
)
const flatMap = curry(pipe(L.flatMap, takeAll))

const range = (l) => {
    const res = [];
    let i = -1;
    while (++i < l) res.push(i)
    return res
}
// only syncronouse reduce
// const reduce = curry(function reduce(f, acc, iter) {

//     if (!iter) {
//         // acc자리에 iter가 들어온 상황
//         iter = acc[Symbol.iterator]();
//         acc = iter.next().value;
//     }

//     for (const a of iter) acc = f(acc, a);
//     return acc
// })

// async reduce 
// const reduce = curry(function reduce(f, acc, iter) {
//     if (!iter) {
//         // acc자리에 iter가 들어온 상황
//         iter = acc[Symbol.iterator]();
//         acc = iter.next().value;
//     }

//     for (const a of iter) acc = acc instanceof Promise ? acc.then(acc => f(acc, a)) : f(acc, a)
//     // 작동은 가능하나, 동기적 비동기적 함수가 혼용된다면 Promise 체인 내부에서 함수가 실행되고
//     // while문을 벗어난다. 
//     // callstack내에서 동작하기를 기대해야한다. 
//     return acc
// })

// welformed reduce
// const reduce = curry(function reduce(f, acc, iter) {
//     if (!iter) {
//         // acc자리에 iter가 들어온 상황
//         iter = acc[Symbol.iterator]();
//         acc = iter.next().value;
//     } else {
//         iter = iter[Symbol.iterator]()
//     }

//     return function recur(acc) {
//         let cur;
//         while (!(cur = iter.next()).done) {
//             a = cur.value
//             acc = f(acc, a);
//             if (acc instanceof Promise) return acc.then(recur)
//         }

//         return acc
//     }(acc)
// })

// handle asyncrouse value
// const reduce = curry(function reduce(f, acc, iter) {
//     if (!iter) {
//         // acc자리에 iter가 들어온 상황
//         iter = acc[Symbol.iterator]();
//         acc = iter.next().value;
//     } else {
//         iter = iter[Symbol.iterator]()
//     }

//     return go1(acc, function recur(acc) {
//         let cur;
//         while (!(cur = iter.next()).done) {
//             a = cur.value
//             acc = f(acc, a);
//             if (acc instanceof Promise) return acc.then(recur, e => e === nop ? acc : Promise.reject(e))
//         }

//         return acc
//     })
// })


// can handle nop
const reduceF = (acc, a, f) =>
    a instanceof Promise ?
        a.then(a => f(acc, a), e => e == nop ? acc : Promise.reject(e)) :
        f(acc, a);

const head = iter => go1(take(1, iter), ([h]) => h);

const reduce = curry((f, acc, iter) => {
    if (!iter) return reduce(f, head(iter = acc[Symbol.iterator]()), iter);

    iter = iter[Symbol.iterator]();
    return go1(acc, function recur(acc) {
        let cur;
        while (!(cur = iter.next()).done) {
            acc = reduceF(acc, cur.value, f);
            if (acc instanceof Promise) return acc.then(recur);
        }
        return acc;
    });
});




const filter = curry(pipe(
    L.filter,
    takeAll
));



module.exports = {
    filter,
    map,
    reduce,
    go,
    pipe,
    curry,
    L,
    take,
    takeAll,
    range,
    find,
    flatMap,
    queryString,
    timeTest,
    join,
    isIterable,
    products
}