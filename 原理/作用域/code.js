function bar() {
    if (1) {
        console.log(test);
    }
}

function foo() {
    bar();
}
let test = 1;
bar(); // 1
