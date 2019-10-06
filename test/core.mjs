
import {evaluate} from "../src/eval";
import * as core from "../src/core";
import * as assert from "assert";

describe("core", () => {
    it("creates a list", () => {
        // (list 10 20 30)
        const expr = [core.list, 10, 20, 30];
        assert.deepStrictEqual(evaluate(core.env, expr), expr.slice(1));
    });
});
