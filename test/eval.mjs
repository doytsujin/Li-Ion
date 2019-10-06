
import {evaluate} from "../src/eval";
import * as assert from "assert";

describe("evaluation", () => {
    it("evaluates a number", () => {
        assert.equal(evaluate({}, 12), 12);
    });
    it("evaluates a string", () => {
        assert.equal(evaluate({}, "abc"), "abc");
    });
    it("resolves a symbol", () => {
        const expr = Symbol.for("x");
        assert.equal(evaluate({[expr]: 45}, expr), 45);
    });
    it("rejects an unknown symbol", () => {
        const expr = Symbol.for("x");
        assert.throws(() => evaluate({}, expr));
    });
    it("evaluates a list", () => {
        const add = Symbol.for("add");
        const expr = [add, 20, 30, 40];
        const env = {
            [add]: function (env, ...args) {
                return args.reduce((a, b) => a + b);
            }
        };
        assert.equal(evaluate(env, expr), 90);
    });
    it("evaluates a nested list", () => {
        const add = Symbol.for("add");
        const expr = [add, 20, [add, 3, 4, 5], 30, 40];
        const env = {
            [add]: function (env, ...args) {
                return args.reduce((a, b) => a + b);
            }
        };
        assert.equal(evaluate(env, expr), 102);
    });
    it("rejects an invalid function call", () => {
        const add = Symbol.for("add");
        const expr = [add, 20, 30, 40];
        assert.throws(() => evaluate({}, expr));
    });
    it("quotes a symbol", () => {
        const quote = Symbol.for("quote");
        const x = Symbol.for("x");
        const expr = [quote, x];
        assert.equal(evaluate({[x]: 45}, expr), x);
    });
    it("rejects let bindings with odd length", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        const let_ = Symbol.for("let");
        const expr = [let_, [x, 10, y], y];
        assert.throws(() => evaluate({}, expr));
    });
    it("executes let expressions", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        const let_ = Symbol.for("let");
        const expr1 = [let_, [x, 10, y, 20], x];
        const expr2 = [let_, [x, 10, y, 20], y];
        assert.equal(evaluate({}, expr1), 10);
        assert.equal(evaluate({}, expr2), 20);
    });
    it("executes if expressions", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        const if_ = Symbol.for("if");
        const let_ = Symbol.for("let");
        const gt = Symbol.for("gt");
        const expr1 = [let_, [x, 10, y, 20], [if_, [gt, x, y], x, y]];
        const expr2 = [let_, [x, 30, y, 20], [if_, [gt, x, y], x, y]];
        const env = {
            [gt]: function (env, a, b) {
                return a > b;
            }
        };
        assert.equal(evaluate(env, expr1), 20);
        assert.equal(evaluate(env, expr2), 30);
    });
    it("executes lambda expression", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        const fn = Symbol.for("fn");
        const expr1 = [[fn, [x, y], x], 10, 20];
        const expr2 = [[fn, [x, y], y], 10, 20];
        assert.equal(evaluate({}, expr1), 10);
        assert.equal(evaluate({}, expr2), 20);
    });
    it("executes named function", () => {
        const x = Symbol.for("x");
        const y = Symbol.for("y");
        const let_ = Symbol.for("let");
        const fn = Symbol.for("fn");
        const first = Symbol.for("first");
        const second = Symbol.for("second");
        const expr1 = [let_, [first,  [fn, [x, y], x]], [first,  10, 20]];
        const expr2 = [let_, [second, [fn, [x, y], y]], [second, 10, 20]];
        assert.equal(evaluate({}, expr1), 10);
        assert.equal(evaluate({}, expr2), 20);
    });
});
