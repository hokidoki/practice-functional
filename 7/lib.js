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
const go = (...args) => reduce((acc, f) => f(acc), args)
const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);
const curry = (f) => (arg, ..._) => _.length ? f(arg, ..._) : (...args) => f(arg, ...args);
// 
const map = curry(function map(f, iter) {
    const res = [];
    for (a of iter) res.push(f(a));
    return res;
})

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
    products
}