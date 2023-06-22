let { map, filter, reduce, go, pipe, curry, products, L, take, takeAll, range, find } = require("./lib")
const log = console.log;
const clear = console.clear;
const add = (a, b) => a + b

// callback과 Promise 

// 의도적으로 만든 콜백으로 결과를 전달하느 함수
const add10 = (a, f) => setTimeout(() => f(a + 10), 100);
// add10(10, log)

// Promise를 이용한 함수

const add5 = (a) => new Promise((res, rej) => setTimeout(() => res(a + 5)), 100);

// add5(10)
//     .then(log)

// // 둘의 사용법은 비슷하나 연속적으로 사용시 매우 큰 차이가 발생한다.

// add5(10)
//     .then(add5)
//     .then(add5)
//     .then(log)

// add10(10, (res) => {
//     add10(res, (res) => {
//         add10(res, log)
//     })
// })

//  콜백으로 함수를 전달 받는 경우 매우 불편함을 알 수 있다. 
// 반대로 Promise의 경우, .then으로 실행되었던 코드의 반환 값으로 체인을 형성 할 수 있기 때문에, 매우 가독성이 높다.
// Promise가 콜백과 다른점은 .then이나 catch의 인자를 일급으로 받는 것이다. 이 점이 굉장이 중요하다. 
// 콜백을 사용하는 함수의 경우, 비동기 상황을 코드로 작성하기 때문에, 함수의 결과가 undefined인 것과 달리
// Promise는 대기,성공,실패를 반환한다. 그렇기에, 이 결과로 내가 코드를 더 활용할 수 있게 된다. 

// log( //현재 이 값은 펜딩상태의 프라미스이다.
//     add5(5)
//         .then(add5) // 성공
//         .then(add5) // 성공
//         .then(log) // 성공
// )

// 즉 비동기로 이루어진 상황을 값으로 평가할 수 있다. 

// Promise를 활용하기
let go1 = (a, f) => f(a);
const strictAdd5 = (a) => a + 5;

log("strict", go1(10, strictAdd5))
// 위 코드가 정상적으로 동작하려면 a,f둘다 동기적으로 작동해야 한다.

// log(go1(Promise.resolve(1), strictAdd5)) // 에러인 값 Object Promise 5 

const delay100 = a => new Promise(res => setTimeout(() => res(a), 100));

// 값을 동기적으로 해결하기 위해서는 다음과 같이 go1을 변경해야 한다.
go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);

// go1(delay100(3), strictAdd5)
//     .then((a) => log("go1", a)); //현재 이 값 자체가 프라미스로 평가되기때문에 후속 처리를 할 수 있다. 

const n1 = 10;
const n2 = delay100(n1);

// go1(n2, add5)
//     .then((a) => console.log("before abstract", a)) //이 코드를 아래와 같이 축약 할 수 있다.
// go1(go1(n2, add5), (a) => console.log("abstract test", a)) // 15

// 함수 관점에서 Promise와 모나드
// 모나드란 함수합성을 안전하게 하는 것을 의미한다.
// 함수 합성은 g,f 함수가 존재할때 g에 값을 전달하고 결과를 f에 전달 하는 것을 의미한다.
// f(g(x)) //모나드

let g = a => a + 1;
let f = a => a * a;

log('continuouse composition', f(g(1))) //연속적 합성
log('unstable composition', f(g())); //불안정한 합성 NaN
// 즉 g에 어떤 값이 올지 모를때 문제가 발생하고 불안정함 

([1]).map(g).map(f).forEach((v) => log("stable composition", v));// 배열이 중요한게 아니라 값이 중요하다.

// 전달될 것이 없다면 사이드 이펙트가 없다.
([]).map(g).map(f).forEach((v) => log("stable composition", v));

[1, 2, 3].map(g).filter(a => a % 2).forEach((v) => log("stable composition", v)) //3 
// 비동기를 안전하게 하려는 상황 
Promise.resolve(1).then(g).then(f).then((a) => log("stable composition async result", a)) //4

// kleisli composition
// 오류가 있는 경우 하나의 오류 핸들링 
// 수학에서는 정말 안전하지만 프로그래밍에서는 외부(서버, 브라우저 등)에 의존하기때문에, 
// 정확한 인자가 오지 않을 수 있다. 

//  f(g(x)) === f(g(x)) 는 수학에서 항상 옳지만 프로그래밍에서 오류가 발생하는 경우 틀릴 수도 있다. 
//  f(g(x)) === g(x) 에러가 나서 이런 경우가 존재할 수 있다. 

const User = (id, name) => ({ id, name });

let users = [
    User(1, "a"),
    User(2, "b"),
    User(3, "c")
]

let getUserById = id => find(u => u.id === id, users);

f = ({ name }) => name;
g = getUserById;

fg = (id) => f(g(id));
log("find", fg(2)) // find b
// 문제는 에러가 발생하는 경우 생긴다. 

users.pop();
users.pop();
// log("find", fg(2)) 에러가 발생한다. id를 가진 것이 없고, undefined에서 name추출 하다보니 발생

fg = id => Promise.resolve(id).then(g).then(f).then(log)
// fg(2) 에러가 발생한다.

getUserById = id => find(u => u.id === id, users) || Promise.reject("없습니다.");
g = getUserById
fg = id => Promise.resolve(id).then(g).then(f).catch(a => a)

// fg(2).then(log) //없습니다. 

fg = id => Promise.resolve(id).then(g).then(f)
// fg(2)
//     .then(() => log("then"))
//     .catch(log); // 없습니다.

// go pipe, reduce에서 비동기 제어 

go(
    1,
    a => a + 1,
    a => a + 100,
    a => a + 1000,
    log
) // 1102

// 위의 코드를 의도적으로 비동기로 변경하면 ?

go(
    1,
    a => a + 1,
    a => Promise.resolve(a + 500),
    a => a + 1000,
    log
) // 에러 값 

// 현재 go의 제어권은 reduce가 가지고 있기 떄문에 reduce만 변경하면 된다.

go(
    Promise.resolve(1),
    a => a + 1,
    a => Promise.resolve(a + 500),
    a => a + 1000,
    log
) //첫번째 비동기값을 제어할 수 있어야 한다. handle asyncrouse value

// Promise.then의 주요 규칙
// Promise가 아무리 중첩되어 있어도 resolv되는 값이 프라미스인 경우 제일 밖에서 값을 꺼낼 수 있다.
Promise.resolve(((Promise.resolve(Promise.resolve(100))))).then((a) => log("nesting resolve", a))


























