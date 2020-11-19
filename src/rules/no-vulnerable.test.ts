import { RuleTester } from "eslint";

import rule from "./no-vulnerable";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

tester.run("no-vulnerable", rule, {
  valid: [
    { code: `const x = /a/;` },
    {
      code: `const x = /^(a|a)*$/;`,
      options: [{ permittableComplexities: ["exponential"] }],
    },
    {
      code: `const x = /^a*a*$/;`,
      options: [{ permittableComplexities: ["polynomial"] }],
    },
    {
      code: `const x = /^a$/;`,
      options: [{ timeout: null }],
    },
    {
      code: `const x = /^a$/;`,
      options: [{ timeout: 1000 }],
    },
  ],
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
    {
      code: `const x = /^a{10}$/;`,
      options: [{ timeout: 1, ignoreErrors: false }],
      errors: [
        {
          message: "Error on ReDoS vulnerablity check: timeout",
        },
      ],
    },
    {
      code: `const x = /^(?=a)$/;`,
      options: [{ checker: 'automaton', ignoreErrors: false }],
      errors: [
        {
          message:
            "Error on ReDoS vulnerablity check: look-ahead assertion (unsupported)",
        },
      ],
    },
  ],
});
