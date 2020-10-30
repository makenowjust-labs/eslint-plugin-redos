import { Rule } from "eslint";
import * as ReDoS from "@makenowjust-labo/redos";
import { ordinalize } from "inflected";

const rule: Rule.RuleModule = {
  create: (context) => {
    return {
      Literal: (node) => {
        if (!(node.value instanceof RegExp)) {
          return;
        }

        const { source, flags } = node.value;
        const result = ReDoS.check(source, flags);
        switch (result.complexity) {
          case "constant":
          case "linear":
            break; // safe
          case "exponential":
            context.report({
              message: "Found a ReDoS vulnerable RegExp (exponential).",
              node,
            });
            break;
          case "polynomial":
            context.report({
              message: `Found a ReDoS vulnerable RegExp (${ordinalize(
                result.degree
              )} degree polynomial).`,
              node,
            });
            break;
        }
      },
    };
  },
};

export = rule;
