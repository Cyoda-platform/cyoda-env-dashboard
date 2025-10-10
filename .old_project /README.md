# Preparation
Before starting the installation, please ensure that you have NodeJs installed,version 22 or above, by using the command:

```
node -v
```
If NodeJs is not installed, please install it via the [link](https://nodejs.org/en/download/package-manager)

## Installation
In root folder

## Setup yarn
```
mv .yarnrc.yml.template .yarnrc.yml
corepack enable // If not run previously for this project
```
Please edit the .**yarnrc.yml** file and replace **username:password** with your actual username and password from mvn. If you don't remember, you can check in the **~/.m2/settings.xml** file.

## Project setup
```
yarn install
```

It will install all dependencies and bootstrap the project.

## Setup Env parameters
Before starting development or deployment, please set up the correct environment parameters in each package you intend to use, for example, **packages/cobi**\
Better to use our console utility for that.
```
yarn setup
```
<h1 align="center"> OR </h1>
Manualy 

- For **develop** mode it is **.env.development**. This file already exist.
- For **production** mode
  ```
  mv .env.production.template .env.production
  ```
  And set correct parameters

#### Sonar
For run sonar please run command
```
npm run sonar
```

