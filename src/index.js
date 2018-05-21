import toDoubleQuotes from "to-double-quotes";
import crypto from "crypto";

const regExp = /(process\.env\.(?:\w|_)(?:\w|\d|_)+?)(\s*(?:,|})(?=(?:[^"]*(?<!\\)"[^"]*(?<!\\)")*[^"]*$))/gim;

export default (inputText, prefix = "") => {
  const envs = {};

  const replacer = (match, group, trail) => {
    const hash = crypto.createHash("sha256");
    hash.update(group);
    const digest = `${prefix}${hash.digest("hex")}`;
    envs[digest] = group;
    return `{ "type": "env", "name": "${group}", "ref": "${digest}" }${trail}`;
  };

  const text = toDoubleQuotes(inputText).replace(regExp, replacer);

  return { text, envs };
};
