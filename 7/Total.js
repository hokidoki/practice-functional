const { map, filter, reduce, go, pipe, curry, products } = require("./lib")
const log = console.log;
const clear = console.clear;
const add = (a, b) => a + b
// 지연성이란 코드가 실제로 평가되기전까지 계산을 미루는 것이다. 

const range = (l) => {
    const res = [];
    let i = -1;
    while (++i < l) res.push(i)
    return res
}

log(range(10))
log(reduce(add, range(5)));

const L = {} //lazy namespace;

L.range = function* (l) {

    let i = -1;
    while (++i < l) yield i
}

{
    const iter_1 = L.range(10);
    log(iter_1.next())
    for (a of iter_1) log(a)
    log(reduce(add, L.range(5)))
    clear();
}

const timeTest = (name, time, f) => {
    console.time(name)
    while (time-- >= 0) f()
    console.timeEnd(name)
}

const testCallTime = 10;
timeTest("lazy", testCallTime, () => reduce(add, L.range(1000000)))
timeTest("strict", testCallTime, () => reduce(add, range(1000000)))

//lazy의 성능이 더 우세하다. 
// 이유를 살펴보면 strict한 함수는 배열을 생성, 배열의 공간확보, 배열에 원소 할당이라는 
// 과정을 거치게 되는데, lazy 경우 이 과정이 모두 생략 되었기 때문이다. 

// take 
// x개의 원소 추출
const take = curry(function take(l, iter) {
    const res = [];
    for (const a of iter) {
        if (res.length <= l) res.push(a);
        else return res;
    }
    return res;
})

go(
    range(1000),
    take(5),
    log
)

go(
    L.range(1000),
    take(5),
    log
)

// strict한 함수는 미리 1000개의 원소를 가진 배열을 만들지만 
// lazy기법을 사용했을 때는 take가 5번 next를 호출 하기 때문에, 성능이 더 우수하다.

clear();

L.map = curry(function* (f, iter) {
    for (a of iter) yield f(a)
})

go(
    [1, 2, 3, 4, 5],
    L.map(a => a + 10),
    take(Infinity),
    log
)

L.filter = curry(function* (f, iter) {
    for (a of iter) if (f(a)) yield a
})

go(
    [1, 2, 3, 4, 5],
    L.filter(a => a % 2),
    take(Infinity),
    log
)

// 함수 중첩 사용 

{
    clear();
    const a = go(
        range(100),
        map(v => v + 10),
        filter(v => v % 2),
        take(2),
        log
    )

    const b = go(
        L.range(100),
        L.map(v => v + 10),
        L.filter(v => v % 2),
        take(2),
        log
    )

    // a와 b의 함수 호출 순서는 정확히 반대이다. 
    // a의 경우 range, map,filter,take순으로 실행되지만
    // b의 경우, take에서 값의 평가가 발생할 때, range,map,filter순으로 작동한다.
    // 이유는 take에서 값을 평가하기 위해서 filter로 이루어진 값을 평가하고,
    // map,range순으로 평가되어야 하기 때문이다. 

    //a의 평가순서는 다음과 같다.
    // range [0,...100]
    // map [10,...110]
    // filter[11,...109]
    // take[11,13,15,17,19]

    //b의 평가 순서는 다음과 같다.
    //range map filter take
    // 0    10  false    
    // 1    11  true    11
    // 2    12  false   
    // 3    13  true    13

    // 이게 가능한 이유는 map, filter가 가지는 결합 법칙 때문이다.
    // 사용하는 데이터가 무엇이던지 사용하는 보조함수가 순수함수라면 
    // 결합이 가능하다. 

    // [mapping,mapping][filter,filter][mapping,mapping] 
    // 은 다음과 같이 변경 가능하다. 
    // [mapping,filter,mapping],[mapping,filter,mapping]
    // 즉 전체를 매핑 -> 필터 -> 매핑 한 결과와 
    // 요소 하나에 매핑 -> 필터 -> 매핑을 전체에 적용한 결과와 동일하기 떄문이다.




}









