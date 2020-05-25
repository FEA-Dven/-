---
title: react+koa2打造都城点餐系统
---
# 前言
第一次写文章，用作个人记录和分享交流，不好之处还请谅解。因本人喜爱吃都城(健康)，在公司叫的外卖都是都城，然后越来越多人跟着我点，而且每次都是我去统计人数，每个人点餐详情，我都是通过企业微信最后汇总到txt文本上再去打电话叫外卖，最后跟都城工作人员确认防止多点少点(真是一把辛酸泪，谁让我这么伟大呢?)。后来本人觉得太麻烦了，便抽了点时间去开发一个专为都城点餐的PC端系统，主要为了方便自己。
# 涉及功能点
1. 登录注册修改账号密码
2. 查看订餐列表
3. 点餐功能
4. 简单聊天功能
5. 评论功能
6. 点赞功能
7. 删除评论功能
8. 查看当天所有订单详情功能
# 项目图片
> 首页
![图片描述][1]
> 菜单列表页
![图片描述][2]
> 聊天页
![图片描述][3]
# 项目地址
github: https://github.com/FEA-Dven/ducheng

线上: https://dywsweb.com/food/login  (账号:admin, 密码:123)
# 技术栈
前端: react + antd 

后端: nodejs + koa2
# 目录介绍
```bash
|---ducheng                                 最外层项目目录 
    |---fontend                             前端项目
        |---app                             主要项目代码 
            |---api                         请求api
            |---assets                      资源管理
            |---libs                        包含公用函数
            |---model                       redux状态管理  
            |---router                      前端路由
            |---style                       前端样式
            |---views                       前端页面组件
                |---chat                    聊天页
                |---component               前端组件
                |---index                   订餐系统首页
                |---login                   登录页
                |---App.js              
            |---config.js                   前端域名配置
            |---main.js                     项目主函数
        |---fontserver                      前端服务
            |---config                      前端服务配置
            |---controller                  前端服务控制层
            |---router                      前端服务路由
            |---utils                       前端服务公用库
            |---views                       前端服务渲染模板
            |---app.js                      前端服务主函数
        |---node_modules        
        |---.babelrc            
        |---.gitignore      
        |---gulpfile.js          
        |---package.json
        |---pm2.prod.json                   构建线上的前端服务pm2配置
        |---README.md      
        |---webpack.config.js               构建配置
    |---backend                             后台项目
        |---app                             主要项目代码 
            |---controller                  控制层
            |---model                       模型层(操作数据库)
            |---service                     服务层
            |---route                       路由
            |---validation                  参数校验
        |---config                          服务配置参数
        |---library                         定义类库
        |---logs                            存放日志
        |---middleware                      中间件
        |---node_modules                 
        |---sql                             数据库sql语句在这里
        |---util                            公共函数库
        |---app.js                          项目主函数
        |---package.json
```

# 前端项目小结

## 1、搭建自己的服务
1. 项目没有用到脚手架，而是自己搭建前端服务器，也是koa2框架。通过koa2解析webpack配置，通过webpack打包生成资源，然后前端服务将资源引入到xtpl中达到渲染效果。
2. 搭建自己的服务器也有好处，可以解决跨域问题，或者通过node作为中间层请求后台服务器。嗯，本项目这些好处都没有用到。
```
if (isDev) {
    // koawebpack模快
    let koaWebpack = require('koa-webpack-middleware')
    let devMiddleware = koaWebpack.devMiddleware
    let hotMiddleware = koaWebpack.hotMiddleware
    let clientCompiler = require('webpack')(webpackConfig)
    app.use(devMiddleware(clientCompiler, {
        stats: {
            colors: true
        },
        publicPath: webpackConfig.output.publicPath,
    }))
    app.use(hotMiddleware(clientCompiler))
}

app.use(async function(ctx, next) { //设置环境和打包资源路径
    if (isDev) {
        let assets ={}
        const publicPath = webpackConfig.output.publicPath
        assets.food = { js : publicPath + `food.js` }
        ctx.assets = assets
    } else {
        ctx.assets = require('../build/assets.json')
    }
    await next()
})
```
## 2、引入HappyPack快速打包
```
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length / 2 }); //根据CPU线程数创建线程池
```
```
plugins: [
    new HappyPack({
      id: 'happyBabel',
      loaders: [{
        loader: 'babel-loader?cacheDirectory=true',
      }],
      threadPool: happyThreadPool,
      verbose: true,
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(env),
    })
].concat(isDev?[ 
    new webpack.HotModuleReplacementPlugin(),
]:[
    new AssetsPlugin({filename: './build/assets.json'}),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
        filename: '[name].[hash:8].css',
        chunkFilename: "[id].[hash:8].css"
    }),
]),
```
### 3、封装路由组件用作权限校验
```
function requireAuthentication(Component) {
    // 组件有已登陆的模块 直接返回 (防止从新渲染)
    if (Component.AuthenticatedComponent) {
        return Component.AuthenticatedComponent
    }
    // 创建验证组件
    class AuthenticatedComponent extends React.Component {
        state = {
            login: true,
        }
        componentWillMount() {
            this.checkAuth();
        }
        componentWillReceiveProps(nextProps) {
            this.checkAuth();
        }
        checkAuth() {
            // 未登陆重定向到登陆页面
            let login = UTIL.shouldRedirectToLogin();
            if (login) {
                window.location.href = '/food/login';
                return;
            }
            this.setState({ login: !login });
        }
        render() {
            if (this.state.login) {
                return <Component {...this.props} />
            }
            return ''
        }
    }
    return AuthenticatedComponent
}
```
> 思路:这个权限校验的组件将其他组件设为参数传入，当加载页面的时候，权限校验组件会先进行权限校验，当浏览器没有cookie指定的参数时，直接返回登录页
```
<Provider store={store}>
    <Router history={browserHistory} >
        <Switch>
            <Route path="/food/login" exact component={Login}/>
            <Route path="/food/index" component={requireAuthentication(Index)}/>
            <Route path="/food/chat" component={requireAuthentication(Chat)}/>
            <Route component={Nomatchpage}/>
        </Switch>
    </Router>
</Provider>
```
### 4、通过webpack设置主题色
```
{
    test: /\.less|\.css$/,
    use: [
        {
            loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader
        }, {
            loader: "css-loader"
        }, {
            loader: "less-loader",
            options: {
                javascriptEnabled: true,
                modifyVars: {
                    'primary-color': '#0089ce',
                    'link-color': '#0089ce'
                },
            }
        }
    ]
}
```
### 5、其他
1. 网页保存cookie的用户id，请求时放入header带去服务器，识别哪个用户操作
2. 每个页面都是零散的组件拼起来，所以组件之间的数据要处理好

# 后端项目小结
### 框架设计
>主要分为 controller层, service层, model层。
1. controller层作用于接收参数，然后做参数校验，再将参数传入到service层做业务逻辑
2. service层做业务逻辑
3. model层调用数据库
### 数据库详情
1. 数据库用的是mysql
2. 查询数据库用的是SQL查询构建器Knex
```
this.readMysql = new Knex({
    client: 'mysql',
    debug: dbConfig.plat_read_mysql.debug,
    connection: {
        host: dbConfig.plat_read_mysql.host,
        user: dbConfig.plat_read_mysql.user,
        password: dbConfig.plat_read_mysql.password,
        database: dbConfig.plat_read_mysql.database,
        timezone: dbConfig.plat_read_mysql.timezone,
    },
    pool: {
        min: dbConfig.plat_read_mysql.minConnection,
        max: dbConfig.plat_read_mysql.maxConnection
    },
});
this.writeMysql = new Knex({
    client: 'mysql',
    debug: dbConfig.plat_write_mysql.debug,
    connection: {
        host: dbConfig.plat_write_mysql.host,
        user: dbConfig.plat_write_mysql.user,
        password: dbConfig.plat_write_mysql.password,
        database: dbConfig.plat_write_mysql.database,
        timezone: dbConfig.plat_write_mysql.timezone,
    },
    pool: {
        min: dbConfig.plat_write_mysql.minConnection,
        max: dbConfig.plat_write_mysql.maxConnection
    },
});
```
3. 上面代码用了两个查询构造器区分写入数据库动作和读取数据库动作
### 写一个鉴权的中间件
```
checkHeader: async function(ctx, next) {
    await validator.validate(
        ctx.headerInput,
        userValidation.checkHeader.schema,
        userValidation.checkHeader.options
    )
    let cacheUserInfo = await db.redis.get(foodKeyDefines.userInfoCacheKey(ctx.headerInput.fid))
    cacheUserInfo = UTIL.jsonParse(cacheUserInfo);
    // 如果没有redis层用户信息和token信息不对称，需要用户重新登录
    if (!cacheUserInfo || ctx.headerInput.token !== cacheUserInfo.token) {
        throw new ApiError('food.userAccessTokenForbidden');
    }
    await next();
}
```
> 使用鉴权中间件，拿一个路由作为例子
```
//引入
const routePermission = require('../../middleware/routePermission.js');
// 用户点餐
router.post('/api/user/order', routePermission.checkHeader, userMenuController.userOrder);
```
### 请求错误码封装
> 定义一个请求错误类
```
class ApiError extends Error {
    /**
     * 构造方法
     * @param errorName 错误名称
     * @param params 错误信息参数
     */
    constructor(errorName, ...params) {
        super();
        let errorInfo = apiErrorDefines(errorName, params);
        this.name = errorName;
        this.code = errorInfo.code;
        this.status = errorInfo.status;
        this.message = errorInfo.message;
    }
}
```
> 错误码定义
```
const defines = {
    'common.all': {code: 1000, message: '%s', status: 500},
    'request.paramError': {code: 1001, message: '参数错误 %s', status: 200},
    'access.forbidden': {code: 1010, message: '没有操作权限', status: 403},
    'auth.notPermission': {code: 1011, message: '授权失败 %s', status: 403},
    'role.notExist': {code: 1012, message: '角色不存在', status: 403},
    'auth.codeExpired': {code: 1013, message: '授权码已失效', status: 403},
    'auth.codeError': {code: 1014, message: '授权码错误', status: 403},
    'auth.pargramNotExist': {code: 1015, message: '程序不存在', status: 403},
    'auth.pargramSecretError': {code: 1016, message: '程序秘钥错误', status: 403},
    'auth.pargramSecretEmpty': {code: 1016, message: '程序秘钥为空，请后台配置', status: 403},

    'db.queryError': { code: 1100, message: '数据库查询异常', status: 500 },
    'db.insertError': { code: 1101, message: '数据库写入异常', status: 500 },
    'db.updateError': { code: 1102, message: '数据库更新异常', status: 500 },
    'db.deleteError': { code: 1103, message: '数据库删除异常', status: 500 },

    'redis.setError': { code: 1104, message: 'redis设置异常', status: 500 },

    'food.illegalUser' : {code: 1201, message: '非法用户', status: 403},
    'food.userHasExist' : {code: 1202, message: '用户已经存在', status: 200},
    'food.objectNotExist' : {code: 1203, message: '%s', status: 200},
    'food.insertMenuError': {code: 1204, message: '批量插入菜单失败', status: 200},
    'food.userNameInvalid': {code: 1205, message: '我不信你叫这个名字', status: 200},
    'food.userOrderAlready': {code: 1206, message: '您已经定过餐了', status: 200},
    'food.userNotOrderToday': {code: 1207, message: '您今天还没有订餐', status: 200},
    'food.orderIsEnd': {code: 1208, message: '订餐已经截止了，欢迎下次光临', status: 200},
    'food.blackHouse': {code: 1209, message: '别搞太多骚操作', status: 200},
    'food.userAccessTokenForbidden': { code: 1210, message: 'token失效', status: 403 },
    'food.userHasStared': { code: 1211, message: '此评论您已点过赞', status: 200 },
    'food.canNotReplySelf': { code: 1212, message: '不能回复自己的评论', status: 200 },
    'food.overReplyLimit': { code: 1213, message: '回复评论数已超过%s条，不能再回复', status: 200 }
};

module.exports = function (errorName, params) {
    if(defines[errorName]) {
        let result = {
            code: defines[errorName].code,
            message: defines[errorName].message,
            status: defines[errorName].status
        };

        params.forEach(element => {
            result.message = (result.message).replace('%s', element);
        });

        return result;
    }
    
    return {
        code: 1000,
        message: '服务器内部错误',
        status: 500
    };
}
```
### 抛错机制
当程序判断到有错误产生时，可以抛出错误给到前端，例如token不正确。
```
// 如果没有redis层用户信息和token信息不对称，需要用户重新登录
if (!cacheUserInfo || ctx.headerInput.token !== cacheUserInfo.token) {
    throw new ApiError('food.userAccessTokenForbidden');
}
```
>因为程序有一个回调处理的中间件，所以能捕捉到定义的ApiError
```
// requestError.js
module.exports = async function (ctx, next) {
    let beginTime = new Date().getTime();
    try {
        await next();
        let req = ctx.request;
        let res = ctx.response;
        let input = ctx.input;
        let endTime = new Date().getTime();
        let ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;

        let fields = {
            status: res.status,
            accept: req.header['accept'],
            cookie: req.header['cookie'],
            ua: req.header['user-agent'],
            method: req.method,
            headers: ctx.headers,
            url: req.url,
            client_ip: ip,
            cost: endTime - beginTime,
            input: input
        };

        logger.getLogger('access').trace('requestSuccess', fields);
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            //数据库连接失败
            logger.getLogger('error').fatal('mysql连接失败', e.message, e.code);
            e.code = 1;
            e.message = '数据库连接异常';
        }

        if (e.code === 'ER_DUP_ENTRY') {
            logger.getLogger('error').error('mysql操作异常', e.message, e.code);
            e.code = 1;
            e.message = '数据库操作违反唯一约束';
        }

        if (e.code === 'ETIMEDOUT') {
            logger.getLogger('error').error('mysql操作异常', e.message, e.code);
            e.code = 1;
            e.message = '数据库连接超时';
        }


        let req = ctx.request;
        let res = ctx.response;
        let status = e.status || 500;
        let msg = e.message || e;
        let input = ctx.input;

        let endTime = new Date().getTime();
        let ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;

        let fields = {
            status: res.status,
            accept: req.header['accept'],
            cookie: req.header['cookie'],
            ua: req.header['user-agent'],
            method: req.method,
            headers: ctx.headers,
            url: req.url,
            client_ip: ip,
            cost: endTime - beginTime,
            input: input,
            msg: msg
        };

        ctx.status = status;

        if (status === 500) {
            logger.getLogger('access').error('requestError', fields);
        } else {
            logger.getLogger('access').warn('requestException', fields);
        }
        let errCode = e.code || 1;
        if (!(parseInt(errCode) > 0)) {
            errCode = 1;
        }
        return response.output(ctx, {}, errCode, msg, status);
    }
};
```
> 在app.js中引入中间件
```
/**
 * 请求回调处理中间件
 */
app.use(require('./middleware/requestError.js'));
```
### 数据库创建sql(命名不规范，请见谅)
```
CREATE DATABASE food_program;
USE food_program;
# 用户表
CREATE TABLE t_food_user(
    fid int(11) auto_increment primary key COMMENT '用户id',
    account varchar(255) NOT NULL COMMENT '用户昵称',
    password varchar(255) NOT NULL COMMENT '用户密码',
    role TINYINT(2) DEFAULT 0 COMMENT '用户角色(项目关系，没有用关联表)',
    create_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '创建时间',
    update_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '修改时间',
    status TINYINT(2) DEFAULT 1 NOT NULL COMMENT '状态 0:删除, 1:正常',
    UNIQUE KEY `uidx_fid_user_name` (`fid`,`account`) USING BTREE
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'food 用户表' ;

CREATE TABLE t_food_menu(
    menu_id int(11) auto_increment primary key COMMENT '菜单id',
    menu_name varchar(255) NOT NULL COMMENT '菜单昵称',
    type TINYINT(2) DEFAULT 0 NOT NULL COMMENT '状态 0:每日菜单, 1:常规, 2:明炉烧腊',
    price int(11) NOT NULL COMMENT '价格',
    status TINYINT(2) DEFAULT 1 NOT NULL COMMENT '状态 0:删除, 1:正常',
    create_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '创建时间',
    update_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '修改时间',
    UNIQUE KEY `uidx_menu_id_menu_name` (`menu_id`,`menu_name`) USING BTREE,
    UNIQUE KEY `uidx_menu_id_menu_name_type` (`menu_id`,`menu_name`,`type`) USING BTREE
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'food 菜单列表' ;

CREATE TABLE t_food_user_menu_refs(
    id int(11) auto_increment primary key COMMENT '记录id',
    fid int(11) NOT NULL COMMENT '用户id',
    menu_id int(11) NOT NULL COMMENT '菜单id'
    create_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '创建时间',
    update_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '修改时间',
    status TINYINT(2) DEFAULT 1 NOT NULL COMMENT '状态 0:删除, 1:正常',
    KEY `idx_fid_menu_id` (`fid`,`menu_id`) USING BTREE,
    KEY `idx_fid_menu_id_status` (`fid`,`menu_id`,`status`) USING BTREE
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户选择什么菜单' ;

CREATE TABLE t_food_system(
    id int(11) auto_increment primary key COMMENT '系统id',
    order_end TINYINT(2) DEFAULT 0 NOT NULL COMMENT '订单是否截止',
    update_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '修改时间'
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '都城订单系统' ;

CREATE TABLE t_food_comment(
    comment_id int(11) auto_increment primary key COMMENT '评论id',
    fid int(11) NOT NULL COMMENT '用户id',
    content TEXT COMMENT '评论内容',
    star int(11) DEFAULT 0 NOT NULL COMMENT '点赞数',
    create_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '创建时间',
    update_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '修改时间'
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '都城聊天表' ;

CREATE TABLE t_food_reply(
    reply_id int(11) auto_increment primary key COMMENT '回复id',
    reply_fid int(11) NOT NULL COMMENT '回复用户fid',
    comment_fid int(11) NOT NULL COMMENT '评论用户fid',
    content TEXT COMMENT '回复内容',
    create_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '创建时间',
    update_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '修改时间',
    KEY `idx_reply_fid_comment_fid` (`reply_fid`,`comment_fid`) USING BTREE
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '都城聊天表' ;

CREATE TABLE t_food_comment_star_refs(
    id int(11) auto_increment primary key COMMENT '关系id',
    comment_id int(11) NOT NULL COMMENT '评论id',
    comment_fid int(11) NOT NULL COMMENT '用户id',
    star_fid int(11) NOT NULL COMMENT '点赞用户fid',
    create_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '创建时间',
    update_time BIGINT(20) DEFAULT 0 NOT NULL COMMENT '修改时间',
    UNIQUE KEY `idx_comment_id_fid_star_fid` (`comment_id`,`comment_fid`,`star_fid`) USING BTREE
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '都城评论点赞关联表' ;
```
# 项目部署
## 前端部署
### 本地开发
> npm run dev
### 开发路径
> http://localhost:3006/food/login
### 线上部署
> npm install pm2 -g

> npm run build

会生成一个build的文件夹，里面是线上需要用到的资源
> 
### nginx设置
```
// /opt/food/fontend/build/ 是npm run build的文件夹路径
location /assets/ {
   alias /opt/food/fontend/build/;
}
location / {
  proxy_pass http://127.0.0.1:3006/;
}
```
### 使用pm2开启项目
> pm2 start pm2.prod.json
## 后端部署
### 本地开发
> pm2 start app.js --watch

开启 --watch 模式监听项目日志
### 线上部署
> pm2 start app.js

千万不要开启 --watch，因为没请求一次服务会刷新产生数据库和redis重连，导致报错
# 结尾
开发完这个系统用了三个星期赶上寒冬我就离职了...然后去面试一些公司拿这个小玩意给面试官看，HR挺满意的，就是不知道技术官满不满意。

欢迎大家来交流哦~