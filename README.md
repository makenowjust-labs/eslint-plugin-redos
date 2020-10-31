# eslint-plugin-redos

> [ESLint][] plugin for catching [ReDoS][] vulnerability.

[ESLint]: https://eslint.org
[ReDoS]: https://en.wikipedia.org/wiki/ReDoS

[![CI Status](https://img.shields.io/github/workflow/status/MakeNowJust-Labo/eslint-plugin-redos/Node/master?logo=github&style=for-the-badge)](https://github.com/MakeNowJust-Labo/eslint-plugin-redos/actions)
[![npm (scoped)](https://img.shields.io/npm/v/eslint-plugin-redos?logo=javascript&style=for-the-badge)](https://www.npmjs.com/package/eslint-plugin-redos)

## Installation

```console
$ npm install eslint-plugin-redos
```

Then, in your `.eslintrc.json`:

```json
{
  "plugins": ["redos"],
  "rules": {
    "redos/no-vulnerable": "error"
  }
}
```

This plugin contains the only rule `redos/no-vulnerable`.

- - -

# Disallow ReDoS vulnerable RegExp literals (`redos/no-vulnerable`)

## Rule Details

Almost all JavaScript's `RegExp` matching engines are backtrack based,
and it is known that such an engine causes [ReDoS][] (**Regular Expression Denial of Service**) vulnerability.
This rule detects a RegExp literal causing problematic backtracking behavior potentially.

:-1: Examples of **incorrect** code for this rule:

```javascript
/*eslint redos/no-vulnerable: "error"*/

// Exponential times backtracking examples:
/^(a*)*$/;
/^(a|a)*$/;
/^(a|b|ab)*$/;

// Polynomial times backtracking examples:
/^a*a*$/;
/^[\s\u200c]+|[\s\u200c]+$/; // See https://stackstatus.net/post/147710624694/outage-postmortem-july-20-2016.
```

:+1: Examples of **correct** code for this rule:

```javascript
/*eslint redos/no-vulnerable: "error"*/

// Fixed times backtracking examples:
/^a$/;
/^foo$/;

// Linear times backtracking examples;
/foo/;
/(a*)*/;
```

## Options

The following is the default configuration.

```json
{
  "redos/no-vulnerable": [
    "error",
    {
      "ignoreErrors": true,
      "permittableComplexities": [],
      "timeout": 5000
    }
  ]
}
```

### `ignoreErrors`

This flag is used to determine to ignore errors on ReDoS vulnerable detection.

Errors on ReDoS vulnerable detection are:

  - the pattern is invalid.
  - the pattern is not supported to analyze.
  - analysis is timeout.

They are ignored because they are noisy usually.

### `permittableComplexity`

This array option controls permittable matching complexity.
It allows the following values.

  - `'polynomial'`
  - `'exponential'`

We strongly recommend considering `'polynomial'` matching complexity RegExp as ReDoS vulnerable.
However, this option can disable it.

### `timeout`

This option specifies a time-out limit for ReDoS analyzing.
A time-unit is milli-seconds.
If `null` is specified, it means unlimited time-out.

The default value is `5000` (5 seconds).

## Related Projects

  - [@makenowjust-labo/redos](https://makenowjust-labo.github.io/redos): a ReDoS detection library used in this plugin.

- - -

## License

MIT license.

2020 (C) TSUYUSATO "MakeNowJust" Kitsune
