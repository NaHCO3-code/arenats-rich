/**
 * 得到更好的控制台输出
 *  - 清晰的层级显示，让输出更美观
 *  - 自动展开对象、数组，让debug更简单
 *  - 自定义最大展开深度、最大长度、占位符、tab字符等
 *  - 循环引用检测
 * @example Rich.print(obj)
 * @todo 稀疏数组支持
 */
export class Rich {
    static enable = true;
    static config = {
        maxDepth: 5,
        maxLength: 40,
        placeholder: '(...)',
        tab: '|---'
    };
    static visitedObj = new WeakSet();
    static handlers = [
        {
            condition: obj => obj === null,
            handler: () => 'null',
        },
        {
            condition: obj => obj === undefined,
            handler: () => 'undefined'
        },
        {
            condition: obj => typeof obj === 'string',
            handler: obj => `"${obj}"`,
            cut: true
        },
        {
            condition: obj => typeof obj === 'number'
                || typeof obj === 'bigint'
                || typeof obj === 'boolean'
                || typeof obj === 'symbol',
            handler: obj => obj.toString(),
            cut: true
        },
        {
            condition: (_, depth) => depth >= Rich.config.maxDepth,
            handler: _ => this.config.placeholder
        },
        {
            condition: obj => obj instanceof Array,
            handler: (obj, depth, fn) => '[' + obj.map(v => fn(v, depth)).join(', ') + ']'
        },
        {
            condition: obj => obj instanceof Date,
            handler: obj => obj.toISOString()
        },
        {
            condition: obj => obj instanceof Function,
            handler: obj => `Function ${obj.name}`
        },
        {
            condition: obj => typeof obj === 'object',
            handler: (obj, depth, fn) => {
                if (Rich.visitedObj.has(obj)) {
                    return '(Circular Reference)';
                }
                Rich.visitedObj.add(obj);
                const keys = Object.keys(obj);
                if (keys.length == 0) {
                    return '{}';
                }
                const ctxTab = Rich.config.tab.repeat(depth + 1);
                const ctx = keys
                    .map(key => `${key}: ${fn(obj[key], depth + 1)}`)
                    .join(`,\n${ctxTab}`);
                Rich.visitedObj.delete(obj);
                return `${obj.constructor?.name ?? ""} {\n${ctxTab}${ctx}\n${Rich.config.tab.repeat(depth)}}`;
            }
        }
    ];
    static objToString(obj, depth = 0) {
        for (const handler of Rich.handlers) {
            if (!handler.condition(obj, depth)) {
                continue;
            }
            let ctx = handler.handler(obj, depth, Rich.objToString);
            if (handler.cut && ctx.length >= Rich.config.maxLength) {
                ctx = ctx.slice(0, Rich.config.maxLength / 2) + '...' + ctx.slice(-Rich.config.maxLength / 2);
            }
            return ctx;
        }
        return `${typeof obj}(${obj?.toString() ?? '...'})`;
    }
    static print(...args) {
        if (!Rich.enable) {
            return;
        }
        const strs = args.map(obj => Rich.objToString(obj));
        console.log(strs.join(" "));
    }
}
