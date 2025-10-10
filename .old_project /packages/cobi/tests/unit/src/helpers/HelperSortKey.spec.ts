import sortKeys from "../../../../src/helpers/HelperSortKey";

describe("sortKeys", () => {
  describe("deepSortArray", () => {
    it("should sort elements of a nested array alphabetically", () => {
      const input = [3, [1, 5, 2], 4];
      const expectedOutput = [
        3,
        [
          1,
          5,
          2
        ],
        4
      ];
      expect(sortKeys(input)).toEqual(expectedOutput);
    });

    it("should sort elements of a deeply nested array alphabetically", () => {
      const input = [3, [1, [5, 2], 4]];
      const expectedOutput = [
        3,
        [
          1,
          [
            5,
            2
          ],
          4
        ]
      ];
      expect(sortKeys(input)).toEqual(expectedOutput);
    });
  });

  it("should sort object keys alphabetically by default", () => {
    const input = {
      z: 3,
      a: 1,
      c: 2,
    };
    const expectedOutput = {
      a: 1,
      c: 2,
      z: 3,
    };
    expect(sortKeys(input)).toEqual(expectedOutput);
  });

  it("should sort array elements alphabetically by default", () => {
    const input = [3, 1, 2];
    const expectedOutput = [
      3,
      1,
      2
    ];
    expect(sortKeys(input)).toEqual(expectedOutput);
  });

  it("should sort object keys using a custom comparison function", () => {
    const input = {
      z: 3,
      a: 1,
      c: 2,
    };
    const expectedOutput = {
      z: 3,
      c: 2,
      a: 1,
    };
    const compareFn = (a, b) => b.localeCompare(a); // Reverse order
    expect(sortKeys(input, { compare: compareFn })).toEqual(expectedOutput);
  });

  it("should sort array elements using a custom comparison function", () => {
    const input = ["z", "a", "c"];
    const expectedOutput = [
      "z",
      "a",
      "c"
    ];
    const compareFn = (a, b) => b.localeCompare(a); // Reverse order
    expect(sortKeys(input, { compare: compareFn })).toEqual(expectedOutput);
  });

  // Add more test cases to cover deep sorting and other scenarios
});
