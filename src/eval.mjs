

export function toString(expr) {
    switch (typeof expr) {
        case "symbol": return Symbol.keyFor(expr);
        case "object": return "(" + expr.map(toString).join(" ") + ")";
        default: return JSON.stringify(expr);
    }
}

export function evaluate(env, expr) {
    switch (typeof expr) {
        case "symbol":
            // Variable names are represented as JavaScript symbols.
            // Look-up the given variable name in the current environment
            // and return the corresponding value.
            if (expr in env) {
                return env[expr];
            }
            throw `Unable to resolve symbol: ${toString(expr)}`;

        case "object":
            // Lists are represented as a JavaScript arrays.
            // We do not test that expr is an array: the Lisp parser should
            // not produce objects that are not arrays.

            // We support only one special form: (quote a)
            if (expr[0] === Symbol.for("quote")) {
                if (expr.length === 2) {
                    return expr[1];
                }
                throw `Wrong number of arguments: ${toString(expr)}`;
            }

            // Otherwise, evaluate each element of the array.
            const l = expr.map(e => evaluate(env, e));
            // We expect the first element to be a function.
            // Call it with the current environment and the rest of the list.
            if (typeof l[0] === "function") {
                return l[0].call(null, env, ...l.slice(1));
            }
            throw `Not a function: ${toString(expr[0])}`;

        default:
            // Other supported expression types are numbers and string literals.
            // They are returned as is.
            return expr;
    }
}
