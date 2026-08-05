const assert = require("assert");
const { paginate } = require("../src/paginate");

assert.deepStrictEqual(paginate([1, 2, 3, 4, 5], 1, 2), [1, 2]);
assert.deepStrictEqual(paginate([1, 2, 3, 4, 5], 2, 2), [3, 4]);
