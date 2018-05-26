import { extractEnv, injectEnv, envKey } from "../src";

test("works correctly", () => {
  const text = `
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

  const json = extractEnv(text);

  expect(json).toMatchSnapshot();
  expect(json[envKey]).toMatchSnapshot();

  const result = injectEnv(json);

  expect(result).toMatchSnapshot();
});
