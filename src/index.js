import crypto from "crypto";

const regExp = /(process\.env\.(?:\w|_)(?:\w|\d|_)+?)(\s*(?:,|})(?=(?:[^"]*"[^"]*")*[^"]*$))/gim;

export default inputText => {
  const envs = {};

  const replacer = (match, group, trail) => {
    const hash = crypto.createHash("sha256");
    hash.update(group);
    const digest = hash.digest("hex");
    envs[digest] = group;
    return `"${digest}"${trail}`;
  };

  const text = inputText.replace(regExp, replacer);

  return { text, envs };
};
