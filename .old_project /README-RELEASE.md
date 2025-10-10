# Cyoda UI Release Process

Cyoda UI releases can be made in **automatic mode (recommended)** or in **manual mode**.

---

## Automatic Mode

Install the CLI utility (https://bitbucket.org/cyoda/cyoda-ui-cli.git):

```bash
git clone git@bitbucket.org:cyoda/cyoda-ui-cli.git
cd cyoda-ui-cli
yarn
yarn build
npm link # not a typo
```

After that, the `cyoda-ui-cli` command will be available in the console.

### First run

```bash
cyoda-ui-cli init
```
(follow the setup steps)

### Update version

In `cyoda-ui/package.json`, update the version, for example:

```
4.0.0-CP3871-1-SNAPSHOT
```

(this version will automatically be applied to all packages)

### Publish

Run:

```bash
cyoda-ui-cli nexus
```

(confirm package updates and their publishing to Nexus; optionally choose whether to create a branch in `cobi-demo` / `cass-ui` for testing)

---

## Manual Mode

1. Update the version in `cyoda-ui/package.json`, for example:

   ```
   4.0.0-CP3871-1-SNAPSHOT
   ```

2. In each project inside the `packages` folder:
    - set the same version for the package itself and for all its dependencies on `cyoda-ui` packages,
    - then run in each package:
      ```bash
      yarn publish-rep
      ```

3. In the project (for example, `cass-ui`), update all package versions in `package.json` to:

   ```
   4.0.0-CP3871-1-SNAPSHOT
   ```

   Then run:

   ```bash
   yarn
   ```

   (check that `yarn.lock` has been updated, then push the changes)  
   As a result, two files should be modified: `package.json` and `yarn.lock`.

---

## Useful Commands for cyoda-ui-cli:

- Create a new branch for a task:
  ```bash
  cyoda-ui-cli branch CP-...
  ```

- View previously set parameters:
  ```bash
  cyoda-ui-cli configs
  ```
  (the configuration file is stored in the `cyoda-ui-cli` folder and is named `cyoda-ui-cli-config.json`)
