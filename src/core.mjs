
import {toString, evaluate} from "./eval";

export const nil    = Symbol.for("nil");
export const quote  = Symbol.for("quote");
export const list   = Symbol.for("list");
export const let_   = Symbol.for("let");
export const lambda = Symbol.for("lambda");

export const env = {
    [nil]: null,

    [list]: function (env, ...args) {
        return args;
    },

    [let_]: function (env, vars, expr) {
        if (typeof vars !== "object") {
            throw `Variable bindings in let expression must be a list: ${toString(vars)}`;
        }
        if (vars.length % 2 !== 0) {
            throw `The number of variable bindings in let expression must be even: ${toString(vars)}`;
        }

        let newEnv = env;

        for (let i = 0; i < vars.length; i += 2) {
            // Every even element in the list must be a variable name.
            if (typeof vars[i] !== "symbol") {
                throw `Invalid variable name in let binding: ${toString(vars[i])}`;
            }
            // Create a new environment that will contain the new variable.
            newEnv = Object.create(newEnv);
            // Evaluate the right member of the variable binding in the new environment.
            // Assign the result to the current variable name in the new environment.
            newEnv[vars[i]] = evaluate(newEnv, vars[i + 1])
        }

        // Evaluate the body in the new environment.
        return expr === undefined ? null : evaluate(newEnv, expr);
    },

    [lambda]: function (env, params, expr) {
        if (typeof params !== "object") {
            throw `Function parameters must be a list: ${toString(params)}`;
        }
        if (params.some(p => typeof p !== "symbol")) {
            throw `Function parameters must be names: ${toString(params)}`;
        }
        if (new Set(params).size !== params.length) {
            throw `Function parameters must be unique: ${toString(params)}`;
        }
        return function (env, ...args) {
            if (args.length !== params.length) {
                throw `Wrong number of arguments: ${toString(args)}`;
            }
            // Assign arguments to parameter names in a new environment.
            // The evaluate the function body in the new environment.
            const newEnv = Object.create(env);
            params.forEach((p, i) => {
                newEnv[p] = args[i];
            });
            return evaluate(newEnv, expr);
        }
    }
}
