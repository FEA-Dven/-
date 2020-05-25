# Event Loop 执行机制

### 示例代码
``` javascript
console.log('script start');

async function async1() {
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}

async function async2() {
    console.log('async2');
}

setTimeout(() => {
    console.log('setTimeout');
}, 0);

async1();

new Promise(resolve =>{
    console.log('p')
    resolve()
}).then(() => {
    console.log('p1')
})

console.log('script end');
```

### 执行顺序
```
script start
async1 start
async2
p
script end
async1 end
p1
setTimeout
```

### 原理
``` javascript
js EventLoop 事件循环机制:
JavaScript的事件分两种，宏任务(macro-task)和微任务(micro-task)

宏任务：包括整体代码script，setTimeout，setInterval
微任务：Promise.then(非new Promise)，process.nextTick(node中)

事件的执行顺序，是先执行宏任务，然后执行微任务，这个是基础，任务可以有同步任务和异步任务，同步的进入主线程，异步的进入Event Table并注册函数，异步事件完成后，会将回调函数放入Event Queue中(宏任务和微任务是不同的Event Queue)，同步任务执行完成后，会从Event Queue中读取事件放入主线程执行，回调函数中可能还会包含不同的任务，因此会循环执行上述操作。
```
``` javascript
注意： setTimeOut并不是直接的把你的回掉函数放进上述的异步队列中去，而是在定时器的时间到了之后，把回掉函数放到执行异步队列中去。如果此时这个队列已经有很多任务了，那就排在他们的后面。这也就解释了为什么setTimeOut为什么不能精准的执行的问题了。setTimeOut执行需要满足两个条件：
1. 主进程必须是空闲的状态，如果到时间了，主进程不空闲也不会执行你的回掉函数 
2. 这个回掉函数需要等到插入异步队列时前面的异步函数都执行完了，才会执行
```

### 任务执行顺序

#### 第一个宏任务
``` javascript
script start
```

#### 第一个宏任务中的第一个微任务:
``` javascript
async function async1() {
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}

async function async2() {
    console.log('async2');
}

setTimeout(() => {
    console.log('setTimeout');
}, 0);

async1();
```

#### 第一个微任务中存在await关键字，因此先输出
``` javascript
async1 start
```

#### 接着输出
``` javascript
async2
```

#### await阻塞后面的代码执行，因此跳出async函数执行下一个微任务
#### 第一个宏任务中的第二个微任务：
``` javascript
new Promise(resolve =>{
    console.log('p')
    resolve()
}).then(() => {
    console.log('p1')
})
```

#### 碰到promise.then这个微任务会先执行本轮宏任务的同步代码再执行微任务
#### 接着输出
``` javascript
script end
```
#### 接着按顺序执行微任务，按照先进先出原则：
``` javascript
async1 end
```

``` javascript
p1
```

#### 第一个宏任务执行完成，执行第二个宏任务
``` javascript
setTimeout(() => {
    console.log('setTimeout');
}, 0);
```

#### 最后输出
``` javascript
setTimeout
```
