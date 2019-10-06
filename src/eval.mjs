

export function toString(expr) {
    switch (typeof expr) {
        case "symbol": return Symbol.keyFor(expr);
        case "object": return "(" + expr.map(toString).join(" ") + ")";
        default: return JSON.stringify(expr);
    }
}

// Variable names are represented as JavaScript symbols.
// Look-up the given variable name in the current environment
// and return the corresponding value.
function evalSymbol(env, expr) {
    if (expr in env) {
        return env[expr];
    }
    throw `Unable to resolve symbol: ${toString(expr)}`;
}

// Special form: (quote a)
// Returns a.
function evalQuote(env, expr) {
    if (expr.length === 2) {
        return expr[1];
    }
    throw `Wrong number of arguments: ${toString(expr)}`;
}

// Special form: (if c1 e1 c2 e2... eN)
// Returns the value of the first e where c evaluates to a truthy value.
function evalIf(env, expr) {
    for (let i = 1; i < expr.length - 1; i += 2) {
        // We use the same truthiness rules as JavaScript.
        if (evaluate(env, expr[i])) {
            return evaluate(env, expr[i + 1]);
        }
    }
    // The last expression corresponds to the "else" clause.
    if (expr.length % 2 === 0) {
        return evaluate(env, expr[expr.length - 1]);
    }
    return null;
}

// Special form: (let (v1 e1 v2 e2...) eN)
function evalLet(env, expr) {
    if (expr.length !== 3) {
        throw `Wrong number of arguments: ${toString(expr)}`;
    }

    // Check the list of variable bindings.
    // It should be a, possibly empty, list with an even number of elements.
    const vars = expr[1];
    if (typeof vars !== "object") {
        throw `Variable bindings in let expression must be a list: ${toString(vars)}`;
    }
    if (vars.length % 2 !== 0) {
        throw `Wrong number of elements in list of variable bindings: ${toString(vars)}`;
    }

    // Initialize the environment where the body expression will be evaluated.
    let newEnv = env;

    for (let i = 0; i < vars.length; i += 2) {
        // Every even element in the list must be a variable name.
        if (typeof vars[i] !== "symbol") {
            throw `Invalid variable name: ${toString(vars[i])}`;
        }
        // Create a new environment that will contain the new variable.
        newEnv = Object.create(newEnv);
        // Evaluate the right member of the variable binding in the new environment.
        // Assign the result to the current variable name in the new environment.
        newEnv[vars[i]] = evaluate(newEnv, vars[i + 1])
    }

    // Evaluate the body in the new environment.
    return evaluate(newEnv, expr[expr.length - 1]);
}

// Special form: (fn (a1 a2...) e)
function evalFn(env, expr) {
    if (expr.length !== 3) {
        throw `Wrong number of arguments: ${toString(expr)}`;
    }

    // Check the list of parameters.
    // It should be a, possibly empty, list of unique symbols.
    const params = expr[1];
    if (typeof params !== "object") {
        throw `Function parameters must be a list: ${toString(params)}`;
    }
    if (params.some(p => typeof p !== "symbol")) {
        throw `Function parameters must be names: ${toString(params)}`;
    }
    if (new Set(params).size !== params.length) {
        throw `Function parameters must be unique: ${toString(params)}`;
    }

    // Return a new function that evaluates the given function body
    // in an environment that will bind each parameter to an argument.
    const body = expr[expr.length - 1];
    return function (env, ...args) {
        if (args.length !== params.length) {
            throw `Wrong number of arguments: ${toString(args)}`;
        }
        // Assign arguments to parameter names in a new environment.
        // Then evaluate the function body in the new environment.
        const newEnv = Object.create(env);
        params.forEach((p, i) => {
            newEnv[p] = args[i];
        });
        return evaluate(newEnv, body);
    };
}

function evalCall(env, expr) {
    // Evaluate each element of the array.
    const l = expr.map(e => evaluate(env, e));
    // We expect the first element to be a function.
    // Call it with the current environment and the rest of the list.
    if (typeof l[0] === "function") {
        return l[0].call(null, env, ...l.slice(1));
    }
    throw `Not a function: ${toString(expr[0])}`;
}

export function evaluate(env, expr) {
    switch (typeof expr) {
        case "symbol": return evalSymbol(env, expr);
        case "object":
            // Lists are represented as JavaScript arrays.
            // We do not test that expr is an array: the Lisp parser should
            // not produce objects that are not arrays.
            switch (expr[0]) {
                case Symbol.for("quote"): return evalQuote(env, expr);
                case Symbol.for("if"):    return evalIf(env, expr);
                case Symbol.for("let"):   return evalLet(env, expr);
                case Symbol.for("fn"):    return evalFn(env, expr);
                default:                  return evalCall(env, expr);
            }
        // Other supported expression types are literals.
        // They are returned as is.
        default: return expr;
    }
}
