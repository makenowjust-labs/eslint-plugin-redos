import { Rule } from "eslint";
import * as ReDoS from "@makenowjust-labo/redos";
import { ordinalize } from "inflected";

type Options = {
  ignoreErrors: boolean;
  permittableComplexities?: ("polynomial" | "exponential")[];
  timeout?: number | null;
};

const ExpectedException = /\((?:Timeout|Unsupported|InvalidRegExp)Exception\)/;

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow ReDoS vulnerable RegExp literals",
    },
    schema: [
      {
        properties: {
          ignoreErrors: {
            type: "boolean",
          },
          permittableComplexities: {
            type: "array",
            items: {
              enum: ["polynomial", "exponential"],
            },
            additionalItems: false,
            uniqueItems: true,
          },
          timeout: {
            type: ["number", "null"],
            minimum: 0,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create: (context) => {
    const options: Options = context.options[0] || {};
    const {
      ignoreErrors = true,
      permittableComplexities = [],
      timeout = 5000,
    } = options;

    return {
      // TODO: support `new RegExp(...)` call.
      Literal: (node) => {
        if (!(node.value instanceof RegExp)) {
          return;
        }

        try {
          const { source, flags } = node.value;
          const result =
            timeout != null
              ? ReDoS.check(source, flags, timeout)
              : ReDoS.check(source, flags);
          switch (result.complexity) {
            case "constant":
            case "linear":
              break; // safe
            case "exponential":
              if (permittableComplexities.includes("exponential")) break;
              context.report({
                message: "Found a ReDoS vulnerable RegExp (exponential).",
                node,
              });
              break;
            case "polynomial":
              if (permittableComplexities.includes("polynomial")) break;
              const degree = ordinalize(result.degree);
              context.report({
                message: `Found a ReDoS vulnerable RegExp (${degree} degree polynomial).`,
                node,
              });
              break;
          }
        } catch (err) {
          // Test `err` is expected exceptions.
          if (err instanceof Error && ExpectedException.test(err.message)) {
            if (!ignoreErrors) {
              context.report({
                message: `Found an error on ReDoS vulnerable check: ${err.message}`,
                node,
              });
            }
            return;
          }
          throw err; // Re-throw.
        }
      },
    };
  },
};

export = rule;
