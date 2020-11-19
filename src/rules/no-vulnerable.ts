import { Rule } from "eslint";
import * as ReDoS from "@makenowjust-labo/redos";
import { ordinalize } from "inflected";

type Options = {
  ignoreErrors: boolean;
  permittableComplexities?: ("polynomial" | "exponential")[];
  timeout?: number | null;
  checker?: 'hybrid' | 'automaton' | 'fuzz';
};

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
          checker: {
            type: "string",
            enum: ["hybrid", "automaton", "fuzz"]
          }
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
      checker = "hybrid",
    } = options;

    return {
      // TODO: support `new RegExp(...)` call.
      Literal: (node) => {
        if (!(node.value instanceof RegExp)) {
          return;
        }

        const { source, flags } = node.value;
        const config = { timeout: timeout ?? undefined, checker };
        const result = ReDoS.check(source, flags, config);
        switch (result.status) {
          case "safe":
            break;
          case "vulnerable":
            if (
              result.complexity &&
              permittableComplexities.includes(result.complexity?.type)
            ) {
              break;
            }
            switch (result.complexity?.type) {
              case "exponential":
                context.report({
                  message: "Found a ReDoS vulnerable RegExp (exponential).",
                  node,
                });
                break;
              case "polynomial":
                const degree = ordinalize(result.complexity.degree);
                context.report({
                  message: `Found a ReDoS vulnerable RegExp (${degree} degree polynomial).`,
                  node,
                });
                break;
              case undefined:
                context.report({
                  message: "Found a ReDoS vulnerable RegExp.",
                  node,
                });
                break;
            }
            break;
          case "unknown":
            if (ignoreErrors) {
              break;
            }
            switch (result.error.kind) {
              case "timeout":
                context.report({
                  message: `Error on ReDoS vulnerablity check: timeout`,
                  node,
                });
                break;
              case "invalid":
              case "unsupported":
                context.report({
                  message: `Error on ReDoS vulnerablity check: ${result.error.message} (${result.error.kind})`,
                  node,
                });
                break;
            }
        }
      },
    };
  },
};

export = rule;
