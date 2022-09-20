// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Context  } from "koa";

declare module "koa" {
  interface Context {
    success: ({statusCode, data}: { statusCode: number, data: any }) => void;
    error: ({statusCode, code, message}: { statusCode: number, code: string, message: string | undefined }) => void;
    ok: (params: any = {}) => void;
    created: (params: any = {}) => void;
    accepted: (params: any = {}) => void;
  }
}
