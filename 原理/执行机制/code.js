console.log('script start');

async function async1() {
    await async2();
    console.log('async1');
}

async function async2() {
    console.log('async2');
}

async1();

setTimeout(() => {
    console.log('setTimeout');
}, 0);

new Promise(resolve =>{
    console.log('p')
    resolve()
}).then(() => {
    console.log('p1')
})

console.log('script end');