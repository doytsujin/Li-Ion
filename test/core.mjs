
import {evaluate} from "../src/eval";
import * as core from "../src/core";
import * as assert from "assert";

describe("core", () => {
    it("creates a list", () => {
        // (list 10 20 30)
        const expr = [core.list, 10, 20, 30];
        assert.deepStrictEqual(evaluate(core.env, expr), expr.slice(1));
    });
    it("rejects let bindings with odd length", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        // (let '(x 10 y) '(list x y))
        const expr = [core.let_, [core.quote, [x, 10, y]], [core.quote, [core.list, x, y]]];
        assert.throws(() => evaluate(core.env, expr));
    });
    it("executes let expressions", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        // (let '(x 10 y 20) '(list x y))
        const expr = [core.let_, [core.quote, [x, 10, y, 20]], [core.quote, [core.list, x, y]]];
        assert.deepStrictEqual(evaluate(core.env, expr), [10, 20]);
    });
    it("executes lambda expression", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        // ((lambda '(x y) '(list x y)) 10 20)
        const l = [core.lambda, [core.quote, [x, y]], [core.quote, [core.list, x, y]]];
        const expr = [l, 10, 20];
        assert.deepStrictEqual(evaluate(core.env, expr), [10, 20]);
    });
    it("executes named function", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        const f = Symbol.for("f");
        // (let '(f (lambda '(x y) '(list x y))) '(f 10 20))
        const l = [core.lambda, [core.quote, [x, y]], [core.quote, [core.list, x, y]]];
        const expr = [core.let_, [core.quote, [f, l]], [core.quote, [f, 10, 20]]];
        assert.deepStrictEqual(evaluate(core.env, expr), [10, 20]);
    });
});
