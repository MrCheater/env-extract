import JSON5 from "json5";
import crypto from "crypto";
import deepForEach from "deep-for-each";
import toDoubleQuotes from "to-double-quotes";

const regExp = /(process\.env\.(?:\w|_)(?:\w|\d|_)+?)(\s*(?:,|})(?=(?:[^"]*(?<!\\)"[^"]*(?<!\\)")*[^"]*$))/gim;

export const envKey = Symbol();

export const extractEnv = text => {
  const env = {};

  const replacer = (match, group, trail) => {
    const hash = crypto.createHash("sha256");
    hash.update(group);
    const digest = `$${group}/${hash.digest("hex")}`;
    env[digest] = group;
    return `"${digest}"${trail}`;
  };

  const json = JSON5.parse(toDoubleQuotes(text).replace(regExp, replacer));

  Object.defineProperty(json, envKey, {
    value: env
  });

  deepForEach(json, value => {
    try {
      Object.defineProperty(value, envKey, {
        value: env
      });
    } catch (e) {}
  });

  return json;
};

export const injectEnv = json => {
  let text = JSON.stringify(json, null, 2);

  const env = json[envKey];

  if (env) {
    for (const digest of Object.keys(env)) {
      while (true) {
        let prevText = text;
        text = text.replace(`"${digest}"`, env[digest]);
        if (prevText === text) {
          break;
        }
      }
    }
  }

  return text;
};
