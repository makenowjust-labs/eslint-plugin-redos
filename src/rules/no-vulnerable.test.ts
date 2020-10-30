import { RuleTester } from "eslint";

import rule from "./no-vulnerable";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

tester.run("no-vulnerable", rule, {
  valid: [{ code: `const x = /a/;` }],
  invalid: [
    {
      code: `const x = /^(a|a)*$/;`,
      errors: [{ message: "Found a ReDoS vulnerable RegExp (exponential)." }],
    },
    {
      code: `const x = /^a*a*$/;`,
      errors: [
        { message: "Found a ReDoS vulnerable RegExp (2nd degree polynomial)." },
      ],
    },
  ],
});
