import JSON5 from "json5";
import crypto from "crypto";
import deepForEach from "deep-for-each";
import toDoubleQuotes from "to-double-quotes";

const regExp = /(process\.env\.(?:\w|_)(?:\w|\d|_)+)/gim;

export const envKey = Symbol();

export const extractEnv = text => {
  let env = {};
  const correctEnvKeys = [];

  const replacer = (match, group) => {
    const hash = crypto.createHash("sha256");
    hash.update(group);
    const digest = `$${group}/${hash.digest("hex")}`;
    env[digest] = group;
    return `'${digest}'`;
  };

  const json = JSON5.parse(toDoubleQuotes(text).replace(regExp, replacer));

  Object.defineProperty(json, envKey, {
    value: env
  });

  deepForEach({ json }, value => {
    if (!(value && (Array.isArray(value) || value instanceof Object))) return;

    for (let key of Array.isArray(value)
      ? Array.from({ length: value.length }).map((_, idx) => idx)
      : Object.keys(value)) {
      if (!(value[key] != null && value[key].constructor === String)) {
        continue;
      }

      if (env.hasOwnProperty(value[key])) {
        correctEnvKeys.push(value[key]);
        continue;
      }

      for (const digest of Object.keys(env)) {
        const group = env[digest];
        let prevValue = value[key];
        let nextValue = value[key];
        do {
          prevValue = nextValue;
          nextValue = prevValue.replace(`'${digest}'`, group);
        } while (prevValue !== nextValue);
        value[key] = nextValue;
      }
    }

    Object.defineProperty(value, envKey, {
      value: env
    });
  });

  for (const key of Object.keys(env)) {
    if (!correctEnvKeys.includes(key)) {
      delete env[key];
    }
  }

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
