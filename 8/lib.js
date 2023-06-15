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
const go = (...args) => reduce((acc, f) => f(acc), args)
const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);
const curry = (f) => (arg, ..._) => _.length ? f(arg, ..._) : (...args) => f(arg, ...args);
// 
L.range = function* (l) {

    let i = -1;
    while (++i < l) yield i
}
L.map = curry(function* (f, iter) {
    for (a of iter) yield f(a)
})
L.filter = curry(function* (f, iter) {
    for (a of iter) if (f(a)) yield a
})


const timeTest = (name, time, f) => {
    console.time(name)
    while (time-- >= 0) f()
    console.timeEnd(name)
}

const take = curry(function take(l, iter) {
    const res = [];
    for (const a of iter) {
        if (res.length < l) res.push(a);
        else return res;
    }
    return res;
})

const takeAll = take(Infinity);
const map = curry(function map(f, iter) {
    const res = [];
    for (a of iter) res.push(f(a));
    return res;
})

const range = (l) => {
    const res = [];
    let i = -1;
    while (++i < l) res.push(i)
    return res
}
const reduce = curry(function reduce(f, acc, iter) {

    if (!iter) {
        // acc자리에 iter가 들어온 상황
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }

    for (const a of iter) acc = f(acc, a);
    return acc
})

const filter = curry(
    function filter(f, iter) {
        const res = []
        for (const a of iter)
            if (f(a)) res.push(a);

        return res
    }
)



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

    products
}