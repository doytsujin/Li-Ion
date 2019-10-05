
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
});
