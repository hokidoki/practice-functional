let { map, filter, reduce, go, pipe, curry, products, L, take, takeAll, range } = require("./lib")
const log = console.log;
const clear = console.clear;
const add = (a, b) => a + b


// map,filter함수는 결과로 이러ㄹ을 제공하고, reduce와 take는 이터러블의 값을 토대로 새로운 값을 만든다.
// take함수는 x개의 원소를 가진 배열을 반환하는 것이 목적이기에 지연성이 불필요하다. 

let queryString = obj => go(
    obj,
    Object.entries,
    L.map(([k, v]) => `${k}=${v}`),
    reduce((a, b) => a + "&" + b)
)

const obj = {
    limit: 10,
    page: 5,
    type: "string"
}

go(
    obj,
    queryString,
    log
)

// obj를 바로 go의 첫번째 인자로 전달하기 때문에 이는 pipe로 변경할 수 잇다. 
queryString = pipe(
    Object.entries,
    L.map(([k, v]) => `${k}=${v}`),
    reduce((a, b) => a + "&" + b)
)

go(
    obj,
    queryString,
    log
) //결과는 동일하다.

// join함수는 Array 클래스 메서드이기때문에, 다형성이 높지 않다. 
let join = curry((sep = ",", iter) => reduce((a, b) => a + sep + b, iter))


go(
    [1, 2, 3],
    join("&"),
    log
) //1,2,3

queryString = pipe(
    Object.entries,
    L.map(([k, v]) => `${k}=${v}`),
    join("&")
)

go(
    obj,
    queryString,
    log
) //동일

// entries도 지연성을 가질 수 있다. 
L.entries = function* (obj) {
    for (k in obj) yield [k, obj[k]]
}

go(
    obj,
    L.entries,
    takeAll,
    log
)

queryString = pipe(
    L.entries,
    L.map(([k, v]) => `${k}=${v}`),
    join("&")
)
go(
    obj,
    queryString,
    log
) //동일

// join함수는 이터러블을 전달하면 사용 할 수 있기에 다형성이 높다.
function* gen() {
    yield 1;
    yield 2;
    yield 3;
}

log(join("-", gen())) // 1-2-3

// take,find함수 join은 reduce계열의 함수이다. 
// find는 take계열의 함수이다. 

let find = curry((f, iter) => go(
    iter,
    L.filter(f),
    take(1)
))

log(find((a) => a.price > 4000, products))


find = curry(pipe(
    L.filter,
    take(1)
))

log(find((a) => a.price > 4000, products))

// map과 filter를 L.map과 L.filter를 이용해 만들기

map = curry(pipe(
    L.map,
    takeAll
))

filter = curry(pipe(
    L.filter,
    takeAll
));

go(
    [1, 2, 3],
    map((v) => v + 2),
    log
)

go(
    [1, 2, 3],
    filter((v) => v % 2),
    log
)

// Flattern은 전개하는 함수이다. 

const isIterable = (v) => v && v[Symbol.iterator]
L.flattern = function* (iter) {
    for (const a of iter) {
        if (isIterable(a)) for (const b of a) yield b
        else yield a
    }
}

const matrix = [
    [0, 1],
    [2, 3],
    [4, 5],
]

go(
    matrix,
    L.flattern,
    takeAll,
    log
)

const flattern = pipe(
    L.flattern,
    takeAll
)

go(
    matrix,
    flattern,
    log
)

// yeild *을 사용해서, 좀 더 간결하게 만들 수 있다.
// yeild *은 for(a of b) yeild a와 같다.

L.flattern = function* (iter) {
    for (a of iter) {
        if (isIterable(a)) yield* a
        else yield a
    }
}

go(
    matrix,
    L.flattern,
    takeAll,
    log
)

// 재귀적으로 더 깊은 배열도 전개 할 수 있다.
L.deepFlattern = function* (iter) {
    for (a of iter) {
        if (isIterable(a)) yield* L.deepFlattern(a)
        else yield a
    }
}

const deep = [[1], [[1, 2]], [[[3, 4]]]]

go(
    deep,
    L.deepFlattern,
    takeAll,
    log
) // 1,1,2,3,4

// L.flatMap
// 최신 자바스크립트에는 flatMap이 존재한다.
log(matrix.flatMap((a) => {
    return a.map((v) => v + 2)
}))//이 flatMap은 다음과 같다. 

//flattern(matrix.map(arr => arr.map(v => v + 2)))
// 필요한 연산은 모두 하긴하나, 여전히 다형성이나 지연성이 존재하지 않아 아쉽다.
// 결국에는 map을 이용하고, flattern을 하는 것이기에 다음과 같이 작성할 수 있다.
clear();
L.flatMap = curry(pipe(
    L.map,
    L.flattern
))
log(matrix)

go(
    matrix,
    L.flatMap(L.flatMap((a => a + 1))),
    takeAll,
    log
)

go(
    L.flatMap(L.range, [1, 2, 3]),
    takeAll,
    log
)

const flatMap = curry(pipe(L.flatMap, takeAll))
go(
    flatMap(L.range, [1, 2, 3]),
    log
)

// 2차원 배열 다루기
go(
    matrix,
    L.flattern,
    L.filter((a) => a % 2),
    takeAll,
    log
) // 1,3,5

// 실무적 코드 사용
var users = [
    {
        name: 'a', age: 21, family: [
            { name: 'a1', age: 53 }, { name: 'a2', age: 47 },
            { name: 'a3', age: 16 }, { name: 'a4', age: 15 }
        ]
    },
    {
        name: 'b', age: 24, family: [
            { name: 'b1', age: 58 }, { name: 'b2', age: 51 },
            { name: 'b3', age: 19 }, { name: 'b4', age: 22 }
        ]
    },
    {
        name: 'c', age: 31, family: [
            { name: 'c1', age: 64 }, { name: 'c2', age: 62 }
        ]
    },
    {
        name: 'd', age: 20, family: [
            { name: 'd1', age: 42 }, { name: 'd2', age: 42 },
            { name: 'd3', age: 11 }, { name: 'd4', age: 7 }
        ]
    }
];

//20세 미만의 가족 두명 추출

go(
    users,
    L.flatMap((user) => user.family),
    L.filter((f => f.age <= 21)),
    take(2),
    log
)

// 함수형프로그래밍을 사용하지 않는 경우
let abc = users
    .flatMap((v) => v.family)
    .filter((v) => v.age <= 20)
    .slice(0, 2)

log(abc)



