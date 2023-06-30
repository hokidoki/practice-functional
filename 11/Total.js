let { map, filter, reduce, go, pipe, curry, products, L, take, takeAll, range, find } = require("./lib")
const log = console.log;
const clear = console.clear;
const add = (a, b) => a + b
const name_log = curry((name, value) => log(name, value));
//지연평가 + Promise L.map,map,take

const C = {}

function noop() { }
const catchNoop = ([...arr]) =>
    (arr.forEach(a => a instanceof Promise ? a.catch(noop) : a), arr);

C.reduce = curry((f, acc, iter) => {
    const iter2 = catchNoop(iter ? [...iter] : [...acc]);
    return iter ? reduce(f, acc, iter2) : reduce(f, iter2)
})

C.take = curry((l, iter) => take(l, catchNoop([...iter])))
C.takeAll = C.take(Infinity)
C.map = curry(pipe(L.map, C.takeAll))
C.filter = curry(pipe(L.filter, C.takeAll))

// async/await 
// async/await은 비동기 상황을 동기적으로 표현하는 키워드이다. 

const delay100 = (a) => new Promise(res => setTimeout(() => res(a), 100));

const f1 = async () => {
    const p = delay100(10);
    const awaitP = await delay100(20);
    log("promise", p);
    log("awaitP", awaitP)
}

f1();

// async/await 만 안다고모든 비동기 상황을 제어하기는 어렵다. 
// 이유는 await을 사용하는 함수는 Promise를 결국 return해야 하기 때문이다. 
// 결국 다음처럼 사용해도 Promise는 어딘가 존재한다. 

const delayIdentity = async (a) => {
    return await delay100(a)
}
const f1_2 = async () => {
    const a = await delayIdentity(10);
    const b = await delayIdentity(10);

    log(a + b)
}

//이 함수내부에서 사이드 이펙트를 발생시키는 것으로 종료된다면 이 함수 내부에서는 동기적으로 상황을 표현 가능하나, Promise를 가지고 활용하기 어렵다.
f1_2()

const f1_3 = async () => {
    const a = await delayIdentity(10);
    const b = await delayIdentity(10);

    return a + b
}

go(
    f1_3(),
    name_log("use go")
)
f1_3().then(name_log("use then"));
(
    async () => {
        name_log("use iife", await f1_3())
    }
)()

// Array.Prototype.map이 있는데, 왜 map을 쓰는가 ? 

const f2 = async () => {
    const list = range(5);
    const res = await list.map(a => delay100(a + 1));
    log("Promise[]", res);

    log("Promise all", await Promise.all(res))
    // map을 쓰는 이유는 비동기, 동기상황을 안전하게 제어하면서 결과를 만들기 위함이다. 
}

f2()

// async/await으로 제어가능한데, 왜 pipeline이 필요한가 ? 
// pipeline과 async/await이 다루고자 하는 것은 다르다.
// async/await은 표현식으로 갇혀 있는 것이 다루기 어렵다보니, 이를 문장형으로 풀기위한 방법이다. 
// pipeline은 안전하게 함수를 합성하는 것이 목적이고 async는 비동기 제어를 위한것이다. 
// pipeline은 test하기 쉽고 유지보수가 쉽다.
// pipeline은 안전하게 비동기 상황을 연결하거나 함수합성을 쉽게

const f5 = () => {
    return go(
        range(5),
        L.map(a => delay100(a + 1)),
        L.filter(a => a % 2),
        L.map(a => delay100(a + 2)),
        take(3),
        reduce(add),
        name_log("f5")
    )
}
f5()
// f6는 f5를 명령형으로 풀어놓은 함수이다. 

const f6 = async () => {
    const list = range(5);
    const arr = [];
    let res = 0;
    let i = -1;
    while (i++ < list.length) {
        list[i] = delay100(list[i] + 1);
        const a = await list[i];
        if (a % 2) {
            const b = await delay100(a + 2);
            arr.push(b);
            if (arr.length === 3) break
        }
    }

    for (a of arr) res += a;
    log("f6", res);
    return res
}

f6();
//f6는 하나만 달라져도 유지보수가 매우 어려워진다.
//그리고 delay100이 Promise를 반환하지 않게 변경되면 f5는 동기 코드로 결과가 나오는데, f6는
// async함수이기 때문에, 무조건 Promise가 반환된다. 

const delay10 = (a) => a

const f5_2 = () => {
    return go(
        range(5),
        L.map(a => delay10(a + 1)),
        L.filter(a => a % 2),
        L.map(a => delay10(a + 2)),
        take(3),
        reduce(add),
    )
}

const f6_2 = async () => {
    const list = range(5);
    const arr = [];
    let res = 0;
    let i = -1;
    while (i++ < list.length) {
        list[i] = delay10(list[i] + 1);
        const a = await list[i];
        if (a % 2) {
            const b = await delay10(a + 2);
            arr.push(b);
            if (arr.length === 3) break
        }
    }

    for (a of arr) res += a;

    return res
}
name_log("f5_2", f5_2())
name_log("f6_2 Promise", f6_2())

// 동기 상황에서 에러 핸들링 하는 방법 
// optional parameter사용하기

function f7(list = []) {
    return list.map(a => a)
}

f7();

function withTryCatch(list = []) {
    try {
        return list.map((a) => JSON.parse(a))
    } catch (error) {
        log("catched!")
    }
}

function a(list) {

    list.map((a) => JSON.parse(a));
    const c = 10;
    return list.map((a) => JSON.parse(a));

}

withTryCatch(null)
// a().catch(() => log("not work")) 

async function b(list) {
    return list.map((a) => JSON.parse(a));
}

b().catch(() => log("work !"))

// Error가 뿜어져 나오는 조건은 함수가 Promise.reject로 평가되지 않거나, 적절히 에러핸들링을 하지 않았을 때 발생한다.