# `eslint-plugin-redos`

> ESLint plugin for catching ReDoS vulnerability

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

This plugin contains the only rule `'redos/no-vulnerable'`.

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

## License

MIT license.

2020 (C) TSUYUSATO "MakeNowJust" Kitsune
