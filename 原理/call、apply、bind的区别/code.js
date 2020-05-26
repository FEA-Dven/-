function foo() {
    this.a = 2;
    this.b = 3;
    function six() {
        console.log(this.a + this.b);
    }
    this.six = six.bind(this)
}

function bar() {
    console.log(this.a + this.b);
}

var obj = {
    a: 2,
    b: 3
}

let myfoo = new foo();
myfoo.six();  // 5
bar.apply(obj); // 5
bar.call(obj); // 5