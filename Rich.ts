export interface ConvertHandler {
  condition: (obj: any, depth: number) => boolean;
  handler: (obj: any, depth: number, fn: (obj: any, depth: number) => string) => string;
  cut?: boolean
}

export interface RichConfig {
  maxDepth: number;
  maxLength: number;
  placeholder: string;
  tabChar: string;
}

/**
 * 得到更好的控制台输出
 *  - 清晰的层级显示，让输出更美观
 *  - 自动展开对象、数组，让debug更简单
 *  - 自定义最大展开深度、最大长度、占位符、tab字符等
 *  - 循环引用检测
 * @example Rich.print(obj)
 * @todo 稀疏数组支持
 */
export abstract class Rich {
  static output = true;

  static config: RichConfig = {
    maxDepth: 5,
    maxLength: 40,
    placeholder: '(...)',
    tabChar: '|---'
  };

  private static visitedObj: WeakSet<any> = new WeakSet();

  static handlers: ConvertHandler[] = [
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
      handler: obj => obj,
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
      handler: _ => '...'
    },
    {
      condition: obj => obj instanceof Array,
      handler: (obj, depth, fn) => '[' + (obj as Array<any>).map(v => fn(v, depth)).join(', ') + ']'
    },
    {
      condition: obj => obj instanceof Date,
      handler: obj => obj.toISOString()
    },
    {
      condition: obj => obj instanceof Function,
      handler: obj => `Function ${(obj as Function).name}`
    },
    {
      condition: obj => obj instanceof Object,
      handler: (obj, depth, fn) => {
        if(Rich.visitedObj.has(obj)){
          return '(Circular Reference)'
        }
        Rich.visitedObj.add(obj);
        
        const keys = Object.keys(obj);
        if(keys.length == 0){
          return '{}';
        }
        const ctxTab = Rich.config.tabChar.repeat(depth+1);
        const ctx = keys
          .map(key => `${key}: ${fn(obj[key], depth + 1)}`)
          .join(`,\n${ctxTab}`);

        Rich.visitedObj.delete(obj);
        return `${obj.constructor.name} {\n${ctxTab}${ctx}\n${Rich.config.tabChar.repeat(depth)}}`;
      }
    }
  ];


  static toRichString(obj: any, depth: number = 0): string {
    for (const handler of Rich.handlers) {
      if(!handler.condition(obj, depth)){
        continue;
      }
      let ctx = handler.handler(obj, depth, Rich.toRichString);
      if(handler.cut && ctx.length >= Rich.config.maxLength){
        ctx = ctx.slice(0, Rich.config.maxLength / 2) + '...' + ctx.slice(-Rich.config.maxLength / 2);
      }
      return ctx;
    }
    return `${typeof obj}(${obj.toString()??'...'})`;
  }

  static print(...args: any[]){
    if(!Rich.output){
      return;
    }
    let res = "";
    for(let obj of args){
      res += Rich.toRichString(obj);
      res += " ";
    }
    console.log(res);
  }
}