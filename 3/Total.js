const log = console.log;
const clear = console.clear;

// 제너레이터란 
// 이터러블이자, 이터레이터를 생성하는 함수이다. 
// 제너레이터는 함수 선언식으로만 가능하며, funciton키워드 옆에 *를 붙이는 것으로 생성가능하다. 
// yeild 키워드를 만나면 현재 값을 반환하며, 제너레이터 코드가 멈춘다. 
function* gen1() {
    yield 1;
    yield 2;
    yield 3;
}

log([...gen1()]); //1,2,3
for (n of gen1()) log(n) // 1,2,3

function* gen2() {
    yield 1;
    yield 2;
    yield 3;
    return 100; //제너레이터 코드에서 return 키워드는 done을 상징하며,반환되는 값은 false일때 값을 의미한다.
}

const iter = gen2();
log(iter.next()) // 1
log(iter.next()) // 2
log(iter.next()) // 3
log(iter.next()) // 100

clear();

{
    const iter = gen2();
    log(iter[Symbol.iterator]() === iter)// true
}

// 활용 예제 
function* infinity() {
    let i = 0;
    while (true) yield i++;
}
function* limit(l, iter) {
    for (n of iter) {
        yield n
        if (l === n) return //종료
    };
}

function* wellFormedOddNumbers(l) {
    for (n of limit(l, infinity())) if (n % 2) yield n
}

log([...wellFormedOddNumbers(10)]) //1,3,5,7,9
for (n of wellFormedOddNumbers(11)) log(n) // 1,3,5,7,9,11

const custom = {
    [Symbol.iterator]: function* () {
        let i = 3;
        while (i !== 0) yield i--;
        return
    }
}

log([...custom]) //[3,2,1]
for (n of custom) log(n) //3,2,1

const a = [1, 2, 3]

clear();
console.log(a.reduce((acc, n) => {
    console.log(acc);
    return acc + n
}))


