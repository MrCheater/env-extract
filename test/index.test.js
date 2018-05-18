import jsonEnvExtract from "../src";

test("works correctly", () => {
  const inputText = `
    {
      "abc": process.env.ABC,
      "abc2": process.env.ABC,
      'a1': process.env.A1,
      b1: process.env.B1,
      "bcd": 'process.env.BCD',
      'a2': "process.env.A2",
      b2: '\'process.env.B2'
      b3: "\"process.env.B3",
      b4: "\"process.env.B4\""
    }
  `;

  let { text, envs } = jsonEnvExtract(inputText);

  let result = text;

  for (const group in envs) {
    const regex = new RegExp(`"${group}"`, "ig");
    result = result.replace(regex, envs[group]);
  }

  expect(Object.values(envs)).toEqual([
    "process.env.ABC",
    "process.env.A1",
    "process.env.B1"
  ]);
  expect(result).toEqual(inputText);
});
