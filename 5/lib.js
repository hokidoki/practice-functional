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

function map(f, iter) {
    const res = [];
    for (a of iter) res.push(f(a));
    return res;
}

function reduce(f, acc, iter) {
    console.log("welformed reduce")
    if (!iter) {
        // acc자리에 iter가 들어온 상황
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }

    for (const a of iter) acc = f(acc, a);
    return acc
}

function filter(f, iter) {
    const res = []
    for (const a of iter)
        if (f(a)) res.push(a);

    return res
}

module.exports = {
    filter,
    map,
    reduce,
    products
}