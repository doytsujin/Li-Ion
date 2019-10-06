
import {toString, evaluate} from "./eval";

export const nil    = Symbol.for("nil");
export const quote  = Symbol.for("quote");
export const list   = Symbol.for("list");
export const let_   = Symbol.for("let");
export const fn     = Symbol.for("fn");

export const env = {
    [nil]: null,

    [list]: function (env, ...args) {
        return args;
    }
}
