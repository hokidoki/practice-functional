const log = console.log;
const clear = console.clear;

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

// Map 함수 : 순회가능한 요소의 각 버킷을 다른 걸로 변경하는 함수 

const prices = [];
for (p of products) prices.push(p.price);

log(prices)

const names = [];
for (p of products) names.push(p.name);
log(names)

clear();

function map(f, iter) {
    const res = [];
    for (a of iter) res.push(f(a));
    return res;
}

log(map((p) => p.price, products))
log(map((p) => p.name, products))

// 위와 같은 map함수는 이터러블 프로토콜을 따르기만 한 요소에는 모두 대응되어 다형성이 높다.
// 예를 들어 querySelctorAll메서드로 반환되는 NodeList는 Array클래스를 상속받지 않아 map
// 메서드가 존재하지 않지만 위의 map함수를 이용하면 동일한 결과를 얻을 수 있다. 

// document.querySelectorAll("*").map // undefined
// map(n => n.nodeName, document.querySelectorAll("*"))

// 제너레이터로 만들어진 함수도 사용 가능하다. 

function* gen1() {
    yield 1;
    yield 2;
    yield 3;
}

log([...map(v => v * v, gen1())]) // 1 4 9

// Filter함수 
// filter함수는 조건을 충족하는 요소만 리턴하는 함수이다. 

function filter(f, iter) {
    const res = []
    for (const a of iter)
        if (f(a)) res.push(a);

    return res
}

log([...filter(n => n % 2, gen1())]) //1,3

// reduce함수 
// reduce함수는 순환요소를 토대로 한개의 결과값을 만드는 함수이다. 

let total = 0;
for (a of gen1()) total += a;
log(total) //6

function reduce(f, acc, iter) {
    for (a of iter) acc = f(acc, a);
    return acc
}

log(reduce((acc, cur) => acc += cur, 0, gen1())) //6 

{
    // javascript reduce함수는 acc를 생략가능하다. 
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

    log(reduce((acc, cur) => acc += cur, gen1())) //6 

    const add = (a, b) => a + b;

    log(reduce(add, gen1())) //6 

    // 왠만해서는 acc를 입력하는 편이 좋을것 같다.순회가능한 요소의 done : true일때 value가 존재하지 않는다면 acc는 undefined이다. 
    // 객체를 활용시에도 acc를 입력해야 올바르게 작동하기에, f,acc,iter를 활용하자. 
    log(reduce((a, b) => a + b.price, 0, products))

    clear();
}

// 어떤 것이 옳을까 ? 

const add = (a, b) => a + b

const c = reduce(
    add,
    0,
    map(
        v => v.price,
        filter(
            (v) => v.price < 4000,
            products)
    )
)
const d = reduce(
    add,
    0,
    filter(
        v => v < 4000,
        map(v => v.price, products)
    )
)

log(c)
log(d)

// C,D중 무엇이 옳을까 ?c가 더 바람직하다. d에서 add함수와 acc로 미루어 볼 때 이터레이터로 
// number[] 타입이 전달되기를 기대한다. 그렇기에, filter가 아닌 map으로 nubmer[]타입임을 
// 확실히 해두는 것이 올바르다.










