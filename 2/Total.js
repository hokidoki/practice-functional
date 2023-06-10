const log = console.log;
const clear = console.clear;
//Es6 이전 순회와 이후 순회방법
const list = [1, 2, 3];
const str = "abc";


// for문을 사용해 index값을 증가 시키며, 순회하고자 하는 요소에 접근
for (let i = 0; i < list.length; i++) log(list[i]); //1,2,3
for (let i = 0; i < str.length; i++) log(str[i]); //a,b,c

// Es6 부터 사용가능한 for ... of문 
// 훨씬 간결하게 사용가능하다. 순회 가능한 요소는 이터레이터를 가지고 있다.
for (n of list) log(n);
for (c of str) log(c);

clear();

// List 순회 
for (n of list) log(n);

// Set 순회
const set = new Set([1, 2, 3, 4, 1]);
for (n of set) log(n) // 1,2,3,4

// Map 순회
clear();
const map = new Map([["1", 1], ["2", 2], ["3", 3]])
for (kv of map) log(kv); //[ '1', 1 ] [ '2', 2 ] [ '3', 3 ]
for (k of map.keys()) log(k) //"1","2","3"
for (n of map.values()) log(n) //1,2,3
for (kv of map.entries()) log(kv) //[ '1', 1 ] [ '2', 2 ] [ '3', 3 ]

clear();

// 이터러블 : 이터레이터를 리턴하는 [Symbol.iterator] 를 가진 값
// 이터레이터 : {value, done}을 리턴하는 next메서드를 가진 값
// 이터러블/이터레이터 프로토콜 : ...전개연산자 for of문을 사용가능하게 하는 규약 

// 사용자 임의 이터러블 

const custom_iterable = {
    [Symbol.iterator]() {
        let i = 3;
        return {
            next() {
                return i > 0 ? { done: false, value: i-- } : { done: true }
            }
        }
    }
}

const iter = custom_iterable[Symbol.iterator]();

log(iter.next()) // 3
log(iter.next()) // 2
log(iter.next()) // 1
log(iter.next()) // done true

for (const i of custom_iterable) log(i); //3,2,1

// 잘 만들어진 이터레이터는 스스로 이터러블하다. 

const list_2 = [1, 2, 3];
const wellFormed = list_2[Symbol.iterator]();

log(wellFormed.next());
log(wellFormed.next());

for (const n of wellFormed) log(n)
clear()

// for (const i of iter) log(i) Error : Not iterable 

// 잘만든 이터레이터는 자기 자신도 이터러블하기 떄문에, 이터레이터를 표현할 때 this를 return하면 된다.
const customWellformedIterable = {
    [Symbol.iterator]() {
        let i = 3;

        return {
            next() {
                return i > 0 ? { done: false, value: i-- } : { done: true }
            },
            [Symbol.iterator]() {
                return this
            }
        }
    }
}

const wellFormedIterator = customWellformedIterable[Symbol.iterator]();

log(wellFormedIterator.next());
log(wellFormedIterator.next());

for (const a of wellFormedIterator) log(a) // 1

// 전개 연산자 
// 전개 연산자는 순회가능한 요소를 전부나열한 것과 동일하다. 
{
    const list = [1, 2, 3];
    log([...list]) // 1,2,3
    log([...customWellformedIterable]) // 3,2,1
}














