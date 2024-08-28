# ADP SMI Staging

This repository contains the source of an ADP SMI Staging.

## Documentation

The documentation is in Markdown format and stored under the `docs` folder.
For a better developer experience use the `docsify` viewer.

## Contributing

### Quick start

_Prerequisite:_ NodeJS installed

To check documentation with `docsify`:

```bash
npm i docsify-cli -g
docsify serve docs
```

### Install dependencies

For accessing NPM repositories in the ARM, the `ARM_NPM_TOKEN` and `RND_ARM_NPM_TOKEN` must be set
as environment variable.

#### Generate token

Before generating the token the following environment variables must be set:

```bash
export ARM_USER_SELI="<signum>"
export ARM_TOKEN_SELI="<api token from https://arm.seli.gic.ericsson.se/>"
export ARM_USER_SERO="<signum>"
export ARM_TOKEN_SERO="<api token from https://arm.rnd.ki.sw.ericsson.se//>"
```

To generate the tokens use `bob generate-npm-token`.
The `.bob/var.token` and `.bob/var.rnd-token` files will include the generated tokens.

```bash
export ARM_NPM_TOKEN="<generated token from .bob/var.token>"
export RND_ARM_NPM_TOKEN="<generated token from .bob/var.rnd-token>"
```

Now you can install the dependencies.

```bash
npm run ci:all
```

### Install git hook

In the root folder run the installer script:

```bash
./git-hooks/install.sh
```
