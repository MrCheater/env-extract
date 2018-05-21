import JSON5 from "json5";

import envExtract from "../src";

test("works correctly", () => {
  const inputText = `
    {
      "abc": process.env.ABC,
      "abc2": process.env.ABC,
      'a1': process.env.A1,
      b1: process.env.B1,
      "bcd": 'process.env.BCD,',
      'a2': "process.env.A2,",
      b2: '\\'process.env.B2,',
      b3: "\\"process.env.B3,",
      b4: "\\"process.env.B4,\\"",
      json: {
        "abc": process.env.ABC
      },
      test: '""\\'"process.env.ABC,\\'"\\'"'
    }
  `;

  const { text, envs } = envExtract(inputText, "prefix/");

  expect(text).toMatchSnapshot();
  expect(envs).toMatchSnapshot();

  const result = JSON5.parse(text);

  expect(Object.values(envs)).toEqual([
    "process.env.ABC",
    "process.env.A1",
    "process.env.B1"
  ]);
  expect(result.abc).toMatchObject({ type: "env", name: "process.env.ABC" });
  expect(result.abc2).toMatchObject({ type: "env", name: "process.env.ABC" });
  expect(result.a1).toMatchObject({ type: "env", name: "process.env.A1" });
  expect(result.b1).toMatchObject({ type: "env", name: "process.env.B1" });
  expect(result.json.abc).toMatchObject({
    type: "env",
    name: "process.env.ABC"
  });
});
