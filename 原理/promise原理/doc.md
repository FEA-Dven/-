# Promise原理

```
在Promise的内部，有一个状态管理器的存在，有三种状态：pending(进行中)、fulfilled(已完成)、rejected(已拒绝)。
1.Promise对象初始化状态为pending
2.当调用resolve(成功)，会由pending => fulfilled
3.当调用reject(失败)，会由pending => rejected

因此，看上面的代码中的resolve(num)其实是将promise的状态由pengding改为fulfilled,然后向then的成功回调函数传值，reject反之。但是需要记住的是注意promise状态只能由pending => fulfilled/rejected, 一旦修改就不能再变。

当状态为fulfilled(rejected反之)时，then的成功回调函数会被调用，并接受上面传来的num，进而进行操作。promise.then方法每次调用，都返回一个新的promise对象，所以可以链式写法（无论resolve还是reject都是这样）
```