# Arena-Rich
得到更好的控制台输出

# Features
 - 清晰的层级显示，让输出更美观
 - 自动展开对象、数组
 - 自定义最大对象深度、字符串最大长度、占位符、省略字符等
 - 循环引用检测

# Usage
引入 Rich 对象
```ts
import { Rich } from '@dao3fun/arena-rich'
```

使用`Rich.print()`输出各种内容
```ts
Rich.print("hello world");
Rich.print(993244853);
Rich.print({
  name: "surfish",
  age: null,
  gender: undefined,
  friends: [
    "Alray",
    "laiq"
  ],
  address: {
    country: "China"
  }
});
Rich.print(new Date());
Rich.print(1145141919810n);
Rich.print(Symbol("arena"));
Rich.print(world);
```

输出结果：
![alt text](./image.png)

# Configs

## Rich.enable: bool
选择是否启用 Rich 输出，默认为 true。

## Rich.config
配置 Rich 输出的参数

### config.maxDepth: number
输出对象的最大深度，默认为 5。

### config.maxStringLength: number
输出字符串的最大长度，默认为 40。如果字符串超过这个长度，将会从中间位置截断，并添加省略号。

### config.placeholder: string
如果对象嵌套深度超过了 `config.maxDepth`，将会显示这个占位符。默认为 `(...)`。

### config.tab: string
由于 Arena 编辑器中控制台会忽略所有空格，需要有一些字符代替空格展示缩进关系。默认为 `---|`。

# Methods

## Rich.print(...args: any[]): void
在控制台输出内容

## Rich.objToString(obj: any, depth: number = 0): string
arena-rich 内部使用的方法，将任意对象转换为字符串