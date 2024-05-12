import { DefaultContext } from "koa";

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
    } else {
        await next();
    }
};