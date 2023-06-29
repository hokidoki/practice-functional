let { map, filter, reduce, go, pipe, curry, products, L, take, takeAll, range, find } = require("./lib")
const log = console.log;
const clear = console.clear;
const add = (a, b) => a + b
const name_log = curry((name, value) => log(name, value));
//지연평가 + Promise L.map,map,take

const p_arr_1 = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
const p_arr_2 = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
// go(
//     p_arr_1,
//     L.map(a => a + 10),
//     take(2),
//     log
// )

// // 현재 위의 값은 에러가 발생하는 값이다. 그렇기에, L.map에서 promise를 기다린 후, f를 처리하도록 변경해야 한다. 
// // L.map에서 yield go1(a,f)적용 후, Promise change으로 값을 처리하도록 하는 것까지는 성공했으나, 
// // log에서 promise로 처리됨
// // 이를 위해 take도 reduce처럼 재귀적으로 동작 할 수 잇도록 변경함

// go(
//     p_arr_1,
//     map(v => v + 20),
//     take(1),
//     name_log("take_changed")
// )

// // map return Promise
// go(
//     range(5),
//     map(v => Promise.resolve(v + 10)),
//     take(1),
//     name_log("map return Promise"),

// )

// go(
//     p_arr_2,
//     L.map(v => Promise.resolve(v + 10)),
//     take(2),
//     name_log("Promise mapping another promise")
// )

//이게 가능한 이유는 각 Promise들이 체인을 이루기 때문이며, 순서는 동일하게 역순으로 동작한다. 

// Kleslie Composition
// L.filter,filter,nop,take

// go(
//     range(5),
//     L.map(v => Promise.resolve(v + 1)),
//     L.filter(v => v % 2),
//     take(2),
//     name_log("Filter can't resolve Promise")
// ) //현재 이 코드에서 filter의 v 파라메터는 Promise이기 떄문에 Promise % 2를 실행 할 수가 없다. 

// filter에서 Promise를 처리 할수 있도록 변경함.
// go(
//     range(5),
//     L.map(v => Promise.resolve(v + 1)),
//     L.filter(v => v % 2),
//     take(2),
//     reduce(add),
//     name_log("Filter can't resolve Promise")
// ) //이제 필터에서 reject한 nop도 take와 reduce에서 처리가 가능하다. 

// const dummy_nop = Symbol("dummy")
// let acc;
// // 예시
// // catch 콜백에서 reject가 아닌 값을 반환한다면 그 값이 다음 then으로 적용
// Promise
//     .resolve(1)
//     .then(a => a + 1)
//     .then(a => a % 2 ? a : Promise.reject(dummy_nop))
//     .catch(e => e === dummy_nop ? "dummy nop rejected" : Promise.reject(e))
//     .then(name_log("Done!"))
//     .catch(name_log("not Work"));
// // 만약 catch에서 다시 reject된다면 다음 catch로 전달.

// Promise
//     .resolve(1)
//     .then(a => a + 1)
//     .then(a => a % 2 ? a : Promise.reject("Error"))
//     .catch(e => Promise.reject(e))
//     .then(name_log("Not work"))
//     .catch(name_log("it Work rejected error : "));
// // 즉 catch에서 reject가 아닌 값을 전달하면 then체인으로 이동. 그래서 acc를 유지하며 recur을 진행 할 수 있음

// // 지연 평가 + Promise의 효율성 
const delay500 = (a) => new Promise(res => setTimeout(() => (log(a), res(a)), 500));
// go(
//     [1, 2, 3, 4, 5],
//     map((a) => {
//         name_log("return Promise", a)
//         return delay500(a + 10)
//     }),
//     take(2),
//     name_log("efficient")
// )
// go(
//     [1, 2, 3, 4, 5],
//     L.map((a) => {
//         name_log("return Promise", a)
//         return delay500(a + 10)
//     }),
//     take(2),
//     name_log("efficient")
// )
// // strict한 함수와 함께 사용시, 모든 요소에 대해 비동기로 처리 하지만
// // Lazy와 함께 사용시 모든 값을 비동기로 변경하는게 아닌 사용하고자 하는 요소에만 비동기로 처리 가능하기 때문에, 훨씬 효율적이다.

// // 지연된 함수를 병렬적으로 평가 C.reduce, C.take 
// // 비동기 IO는 하나의 쓰레드에서 어떤 IO를 동기적으로 사용하지 않고 병렬적으로 IO를 제어 
// // 즉 IO를 동기적으로 처리했다가는 오래기다리는 동기적 코드를 기다린다고 다른 요청을 실행 하지 못함

// go(
//     range(5),
//     (a) => {
//         console.time("lazy_non efficient")
//         return a
//     },
//     L.map(v => delay500(v + 10)), //500ms * 5의 시간이 발생 
//     L.filter(a => a % 2),
//     reduce(add),
//     name_log("not Concurrent"),
//     () => console.timeEnd("lazy_non efficient")
// )
// //직렬로 한개씩 꺼내어 평가되다 보니, 모든 프라미스에 대해 동기적으로 코드가 동작함
// //일반 map도 동일함. 

// go(
//     range(5),
//     (a) => {
//         console.time("strict_map")
//         return a
//     },
//     map(v => delay500(v + 10)),
//     reduce(add),
//     name_log("not Concurrent"),
//     () => console.timeEnd("strict_map"),
// )


const C = {}

C.reduce = curry((f, acc, iter) => iter ? reduce(f, acc, [...iter]) : reduce(f, [...acc]))

// 차이점은 reduce에서는 순회하면서 평가하기 때문에, 이때 대기가 발생한다. 
// C reduce의 경우[...acc || ...iter]로 인하여, 이때 모든 값들이 평가되어 Promise로 변환되는 것이다. 

// go(
//     range(10),
//     (a) => {
//         console.time("concurrent_map_overload")
//         return a
//     },
//     L.map(v => delay500(v + 10)),
//     C.reduce(add),
//     name_log("concurrent_map_overload result : "),
//     () => console.timeEnd("concurrent_map_overload"), // 500ms
// )

// C.reduce , C.take

// Promise.reject는 늦게 catch로 잡으면 에러가 출력된다. 
// const a = Promise.reject("") //에러 
// setTimeout(() => {
//     a.catch(() => { })
// }) //에러 발생

// go(
//     range(10),
//     (a) => {
//         console.time("filter_not_handle_nop")
//         return a
//     },
//     L.map(v => delay500(v + 10)),
//     L.filter(v => v % 2),
//     C.reduce(add),
//     name_log("filter_not_handle_nop result : "),
//     () => console.timeEnd("filter_not_handle_nop"), // 500ms
// )

// filter_not_handle_nop 에서는 filter에서 reject한 nop을 처리하지 못해 이상한 값이 출력된다.
function noop() { }
const catchNoop = ([...arr]) =>
    (arr.forEach(a => a instanceof Promise ? a.catch(noop) : a), arr);

C.reduce = curry((f, acc, iter) => {
    const iter2 = catchNoop(iter ? [...iter] : [...acc]);
    return iter ? reduce(f, acc, iter2) : reduce(f, iter2)
})

go(
    range(5),
    (a) => {
        console.time("filter_can_handle_nop")
        return a
    },
    L.map(v => delay500(v + 3)),
    L.filter(v => v % 2),
    C.reduce((a, b) => {
        log("add", `acc : ${a}, cur : ${b}`)
        return a + b
    }),
    name_log("filter_can_handle_nop result : "),
    () => console.timeEnd("filter_can_handle_nop"), // 500ms
)

C.take = curry((l, iter) => take(l, catchNoop([...iter])))
C.takeAll = C.take(Infinity)
C.map = curry(pipe(L.map, C.takeAll))
C.filter = curry(pipe(L.filter, C.takeAll))

go(
    range(5),
    (a) => {
        console.time("c_map_test")
        return a
    },
    C.map(a => delay500(a + 5)),
    reduce(add),
    name_log("C.map test"),
    () => console.timeEnd("c_map_test"), // 500ms
)

go(
    range(5),
    (a) => {
        console.time("c_filter_test")
        return a
    },
    L.map(a => delay500(a + 5)),
    C.filter((a) => a % 2), //이때 모두 평가해버림 Promise로 변경되는 시점
    reduce(add),
    name_log("C.map test"),
    () => console.timeEnd("c_filter_test"), // 500ms
)

// go(
//     range(5),
//     (a) => {
//         console.time("strict_map_with_C_filter")
//         return a
//     },
//     map(a => delay500(a + 5)), //동기적으로 Promise를 기다리면서 변경함. 이 코드는 결국 여기서 동기적으로 Promise를 해제해야 C.filter를 작동시킴
//     C.filter((a) => a % 2),
//     reduce(add),
//     name_log("strict_map_with_C_filter test"),
//     () => console.timeEnd("strict_map_with_C_filter"), // 500ms
// )


