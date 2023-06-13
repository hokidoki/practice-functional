const { map, filter, reduce, products } = require("./lib")

const log = console.log;
const clear = console.clear;
const add = (a, b) => a + b
// go함수는 함수를 중첩하여, 값을 생성하는 기존의 코드에서 벗어나,
// 순차적으로 코드를 적용하여, 결과를 만드는 함수이다. 

// 아래의 코드는 reduce내부에 iter를 전달하기 위해 코드를 중첩하여 
// 작성되었기 떄문에 코드의 가독성이 매우 떨어진다.
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

log(c);

// go
// args의 첫번째는 첫번째로 acc에 해당 되어야 할 값이다. 
const go = (...args) => reduce((acc, f) => f(acc), args)


// 아래는 중첩된 함수로 작성된 c를 리팩터 한 코드이다. 
// 순서대로 적용되어야 할 코드가 중첩이 아닌 순서대로 나열되었기 때문에, 
go(
    products, // iter
    (p) => filter(p => p.price < 4000, p),
    (p) => map(p => p.price, p),
    (p) => reduce(add, p),
    log
)

// Pipe 
// pipe함수는 미리 함수의 조합을 만들어 놓을 수 있는 함수이다. 
// 첫번째 함수만 따로 때낸 이유는 go의 첫번째 인자는 iter이며, 함수 생성후 호출 시,
// 2개이상의 전달인자를 전달 할 수 있도록 하기 위함이다.
const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);


const p1 = pipe(
    p => p + 1,
    p => p + 10,
    p => p + 100,
    log
)

p1(10) //121

// Curry
// Curry 함수는 (a,b,c) => a + b + c컨셉이 아닌 (a) => b=> c => a+b+c함수의 컨셉이다.
// 클로저가 적용되어 함수의 호출 시기를 적절하게 조정 할 수 있으며, 가독성이 증가한다. 

const curry = (f) => (arg, ..._) => _.length ? f(arg, ..._) : (...args) => f(arg, ...args);
const add10 = curry(add)(10)
log(add10(20)) // 30;
log(curry(add)(10, 20))// 30 두개 이상 인자와 함께 호출하면 바로 결과 반환
clear();
{
    // curry를 사용해서, map,filter,reduce를 유용하게 사용하기 
    const c_map = curry(map);
    const c_filter = curry(filter);
    const c_reduce = curry(reduce);

    const product_to_numbers = c_map(p => p.price);

    log(product_to_numbers(products));

    const under_4000 = c_filter(p => p.price < 4000);

    log(under_4000(products))

    const extract_total_price = c_reduce((acc, cur) => acc + cur.price);
    log(extract_total_price(0, products));

    go(
        products, // iter
        (p) => filter(p => p.price < 4000, p),
        (p) => map(p => p.price, p),
        (p) => reduce(add, p),
        log
    )

    // 동일한 작동
    go(
        products, // iter
        (p) => c_filter(p => p.price < 4000, p),
        (p) => c_map(p => p.price, p),
        (p) => c_reduce(add, p),
        log
    )

    // 함수호출 시기 조정(고차 함수 기억 후, 호출),
    go(
        products, // iter
        (p) => c_filter(p => p.price < 4000)(p),
        (p) => c_map(p => p.price)(p),
        (p) => c_reduce(add)(p),
        log
    )

    // (f) => (...args) => f(...args)가 될 수있는 특징을 살려 축약
    go(
        products, // iter
        c_filter(p => p.price < 4000),
        c_map(p => p.price),
        c_reduce(add),
        log // 동일한 결과
    )

    // Pipe를 이용해, 함수를 묶음

    const total_price_of_products = pipe(
        c_map(p => p.price),
        c_reduce(add)
    )

    const predi_total_price_of_products = (f) => pipe(
        c_filter(f),
        total_price_of_products
    )

    go(
        products,
        predi_total_price_of_products(p => p.price > 4000),
        log //9500
    )
}




