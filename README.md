# codemgr

`codemgr` provides a tool that helps you keep your Node/Javascript repos in 'similar' shape. It does this by providing you the tooling to setup templates of what you would like your repos to look like and then making it easy to apply that to your repos.

`codemgr` will ensure:

- your NPM config has some basic setting to make setting up your initial `package.json` easier and more accurate
- install your dependencies and devDependencies
- setup scripts in your `package.json`
- copy pre-defined configurations for the tools you have installed in your repos
- copy any other files in your template folder and/or folders to keep a consistent environment for each of your projects

## Installation

```bash
npm install -g codemgr
```

> You can install it locally in your repo as well but it will still look towards your personal configuration that is used across repos.

You should then run the setup to get `codemgr` setup on your system.

```bash
codemgr setup
```

> See the [Setup](#Setup) section below to understand what this does.

## Usage

### Personal Configuration

`codemgr` creates a configuration folder in your home folder named `~/.codemgr` and places all of its default configuration information in this folder. The structure of this folder is:

```bash
.codemgr
   |
   +- config.json
   |
   \- templates
      |
      + default.json
      |
      \- default
```

The `config.json` file defines the default template to use if one isn't specified on the command line. This is set to `default.json` by default.

All templates are stored in the `templates` folder.

### Templates

A template consists of a configuration file and a folder with the files and folders you wish to be apart of your template. The template name is the name of the configuration file (including the `.json`). The folder that matches the base name of the template configuration file will be used to update your repo.

E.g. for a tempalte named `typescript-react` you would have a template configuration file named `typescript-react.json` and a template folder named `typescript-react`.

> It is recommended that you only make changes to your own templates. This will ease upgrades to the default configuration. This isn't required but is recommended. To do so, simply copy `default.json` to a new filename and then copy the contents of the `default` folder to your new template folder name.

#### Template Configuration File

The template configuration file contains the configuration information for the template. Mostly this is information used to control the processing of the script and the information that is used during different sections of the processing.

Here is the template configuration file for `default.json`:

```json
{
  "checks": {
    "gitInit": true,
    "npmInit": true,
    "requiredPackages": true,
    "scripts": true,
    "templateFiles": true
  },
  "requiredPackages": {
    "dependencies": ["tslib"],
    "devDependencies": [
      "typescript",
      "@types/node",
      "@typescript-eslint/eslint-plugin",
      "@typescript-eslint/parser",
      "eslint",
      "eslint-config-prettier",
      "eslint-plugin-prettier",
      "prettier",
      "rimraf"
    ]
  },
  "scripts": {
    "build": "npm run compile",
    "clean:build": "npx rimraf ./build/",
    "clean:all": "npm run clean:build",
    "compile": "npx tsc",
    "cli": "node build/cli.js",
    "fix": "npx eslint --fix '**/*.ts'",
    "format": "npx prettier --write .",
    "lint": "npx eslint '**/*.ts'",
    "prepare": "npm run compile",
    "pretest": "npm run compile"
  }
}
```

##### `checks`

The `checks` section of the template configuration file turns the checks of different configuration items on or off.

- `gitInit` - check if Git is initialized, if not, do (simply run `git init`)
- `npmInit` - check if NPM is initialized, if not, do so (simply run `npm init -y`)
- `requiredPackages` - checks in NPM has the required packages installed, if not, it will do so
- `scripts` - checks if the scripts specified in the `scripts` section are defined in `package.json` and if they are missing they are added
- `templateFiles` - determines if the files and folders found in the template folder are copied into your repo

###### `requiredPackages`

When defining the packages you want installed you can specify the package name and the version/tag if desired. To defined the version/tag just append it after the name using the standard NPM package naming syntax used on the NPM command line (e.g. `eslint@7.19.0`). This will force this version to be installed.

###### `templateFiles`

It is important to understand that anything in the template folder will be copied into your repo folder in the `templateFiles` check is turned on. This includes empty folders, they will still be created for you.

### Setup

When the `codemgr setup` command is run, the app will create a configuration folder for you `~/.codemgr` and copy in a basic default configuration. If this is your initial time running the command this should be all you need to do.

However, over time the `codemgr` application will receive updates and this may include updates to the default configuration/template. To apply these changes you can run the `setup` process again with the `--overwrite` flag. (You can also use `--backup` when you specify `--overwrite` so you keep a copy of your changes if any.)

The `setup` process will also check your NPM configuration and prompt you for values for the author settings, the default version, and the default license. This allows you to have these setting set the way you want for any new repos created through this tool.

### Init

The `init` process is the main action of the `codemgr` application. You use the `init` action to setup your repo the way you want to, and later to update it as required. The basic process is as follows:

```bash
mkdir some-new-project-folder
cd some-new-project-folder
codemgr init
```

This will setup a new project folder with the default template configuration. If you wanted to set it up with a different template simply specify it on the command line.

```bash
codemgr init typescript-react.json
```

> Assuming you had a `typescript-react.json` template configured.

Like the `setup` process, the `init` process can also accept the `--overwrite` and `--backup` command line flags. This allows you to re-run the `init` process on a repo and overwrite the configuration that is already present. This effectively performs an upgrade.

## Alpha/Beta Code

This code base is in varying stages of alpha/beta code. Thus the pre-v1.0.0 release version number. Use this as-is. The tool was written to be generic but is used in a specific way in our environment and therefore more users = better code.

## Issues

Please submit all issues/suggestions/improvements through [codemgr Issues](https://github.com/acmeframework/codemgr/issues)
