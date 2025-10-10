import inquirer from "inquirer";
import axios from "axios";
import {Command, Option} from "commander";
import {parse, stringify} from "envfile";
import * as fs from "fs";
import chalk from 'chalk';
import Table from 'cli-table3';


const program = new Command("setup");


program
  .description("Make .env.production file")
  .action(async (options) => {

    let envExist = {};
    const envTypes = {
      PROD: "./.env.production",
      DEV_LOCAL: "./.env.development.local",
    }

    await checkExistConfigurations(envTypes.PROD);
    await checkExistConfigurations(envTypes.DEV_LOCAL);


    console.log("\n");
    console.log("Welcome to Cyoda UI setup utility. This utility will help to you correct setup UI and check functionality");
    console.log("-------");
    const inquirerResult = await inquirer
      .prompt([
          {
            type: "message",
            message: "If you will use relative paths and not full URL with http(s), utility can not check correct settings",
            name: "confirm"
          },
          {
            type: "list",
            message: "Select env",
            choices: [
              {
                name: "For production",
                value: "PROD",
              },
              {
                name: "For development",
                value: "DEV_LOCAL",
              },
            ],
            name: "envType",
            filter: (input) => {
              if (!fs.existsSync(envTypes[input])) return input;
              const envExistContent = fs.readFileSync(envTypes[input], 'utf-8');
              envExist = parse(envExistContent);
              return input;
            }
          },
          {
            type: "input",
            message: "API url. Example: https://domain.com/api. Default:",
            default: () => envExist.VITE_APP_API_BASE || "/api",
            name: "VITE_APP_API_BASE",
            validate: async (input) => {
              if (!input.includes("http")) return true;
              const {status} = await axios.get(input, {validateStatus: () => true});
              if (status === 401) return true;
              return "API url is not correct";
            }
          },
          {
            type: "input",
            message: "Processing url. Example: https://domain.com/processing. Default: ",
            default: () => envExist.VITE_APP_API_BASE_PROCESSING || "/processing",
            name: "VITE_APP_API_BASE_PROCESSING",
            validate: async (input) => {
              if (!input.includes("http")) return true;
              const {status} = await axios.get(input, {validateStatus: () => true});
              if (status === 401) return true;
              return "Processing url is not correct";
            }
          },
          {
            type: "input",
            message: "Deploy folder. If in root folder '/', if in sub folder '/folder-a' Default: ",
            default: () => envExist.VITE_PUBLIC_PATH || "/",
            name: "VITE_PUBLIC_PATH",
            when: function (answers) {
              return answers.envType === 'PROD';
            },
          },
          {
            type: "input",
            message: "If not empty will be used as VITE_PUBLIC_PATH",
            default: () => envExist.VITE_APP_PUBLIC_PATH || null,
            name: "VITE_APP_PUBLIC_PATH",
            when: function (answers) {
              return answers.envType === 'PROD';
            },
          },
          {
            type: "confirm",
            message: "Do you want also set settings for Feature Flags?",
            name: "confirmFeatureFlags"
          },
          {
            type: "confirm",
            message: "FF: Use ChatBot?",
            name: "VITE_FEATURE_FLAG_CHATBOT",
            default: () => envExist.VITE_FEATURE_FLAG_CHATBOT || null,
            when: function (answers) {
              return answers.confirmFeatureFlags;
            },
          },
          {
            type: "confirm",
            message: "FF: Use Models Info?",
            name: "VITE_FEATURE_FLAG_USE_MODELS_INFO",
            default: () => envExist.VITE_FEATURE_FLAG_USE_MODELS_INFO || null,
            when: function (answers) {
              return answers.confirmFeatureFlags;
            },
          },
          {
            type: "confirm",
            message: "Do you want also set settings for Auth0?",
            name: "confirmAuth0"
          },
          {
            type: "input",
            message: "Auth0: Domain",
            name: "VITE_APP_AUTH0_DOMAIN",
            default: () => envExist.VITE_APP_AUTH0_DOMAIN || null,
            when: function (answers) {
              return answers.confirmAuth0;
            },
          },
          {
            type: "input",
            message: "Auth0: Client ID",
            name: "VITE_APP_AUTH0_CLIENT_ID",
            default: () => envExist.VITE_APP_AUTH0_CLIENT_ID || null,
            when: function (answers) {
              return answers.confirmAuth0;
            },
          },
          {
            type: "input",
            message: "Auth0: Audience",
            name: "VITE_APP_AUTH0_AUDIENCE",
            default: () => envExist.VITE_APP_AUTH0_AUDIENCE || null,
            when: function (answers) {
              return answers.confirmAuth0;
            },
          },
        {
            type: "input",
            message: "Auth0: Organization",
            name: "VITE_APP_AUTH0_ORGANIZATION",
            default: () => envExist.VITE_APP_AUTH0_ORGANIZATION || null,
            when: function (answers) {
              return answers.confirmAuth0;
            },
          },
          {
            type: "input",
            message: "Auth0: Redirect Uri",
            name: "VITE_APP_AUTH0_REDIRECT_URI",
            default: () => envExist.VITE_APP_AUTH0_REDIRECT_URI || null,
            when: function (answers) {
              return answers.confirmAuth0;
            },
          },
        ]
      );

    const env = {
      VITE_APP_API_BASE: inquirerResult.VITE_APP_API_BASE || '',
      VITE_APP_API_BASE_PROCESSING: inquirerResult.VITE_APP_API_BASE_PROCESSING || '',
      VITE_PUBLIC_PATH: inquirerResult.VITE_PUBLIC_PATH || '',
      VITE_APP_PUBLIC_PATH: inquirerResult.VITE_APP_PUBLIC_PATH || '',
    }

    if (inquirerResult.confirmFeatureFlags) {
      env.VITE_FEATURE_FLAG_CHATBOT = inquirerResult.VITE_FEATURE_FLAG_CHATBOT;
      env.VITE_FEATURE_FLAG_USE_MODELS_INFO = inquirerResult.VITE_FEATURE_FLAG_USE_MODELS_INFO;
    } else {
      env.VITE_FEATURE_FLAG_CHATBOT = false;
      env.VITE_FEATURE_FLAG_USE_MODELS_INFO = false;
    }

    if (inquirerResult.confirmAuth0) {
      env.VITE_APP_AUTH0_DOMAIN = inquirerResult.VITE_APP_AUTH0_DOMAIN || '';
      env.VITE_APP_AUTH0_CLIENT_ID = inquirerResult.VITE_APP_AUTH0_CLIENT_ID || '';
      env.VITE_APP_AUTH0_AUDIENCE = inquirerResult.VITE_APP_AUTH0_AUDIENCE || '';
      env.VITE_APP_AUTH0_ORGANIZATION = inquirerResult.VITE_APP_AUTH0_ORGANIZATION || '';
      env.VITE_APP_AUTH0_REDIRECT_URI = inquirerResult.VITE_APP_AUTH0_REDIRECT_URI || '';
    }


    const envContent = stringify(env);
    fs.writeFileSync(envTypes[inquirerResult.envType], envContent);
    console.log('\n-----------');
    console.log(`File "${envTypes[inquirerResult.envType].replace('./','')}" was created. Now run:\n`);
    if (inquirerResult.envType === 'DEV_LOCAL') {
      console.log(
        `  ${chalk.green.bold(`yarn dev`)}\n`
      )
    } else if (inquirerResult.envType === 'PROD') {
      console.log(
        `  ${chalk.green.bold(`yarn build:app`)}\n`
      )
    }
  });

function displayEnvInTable(data) {
  const table = new Table({
    style: {head: ['green']},
    head: ['Keys', 'Values'],
  });

  Object.keys(data).forEach((key) => {
    table.push([key, data[key]]);
  });
  console.log(table.toString());
}

async function checkExistConfigurations(path) {
  if (fs.existsSync(path)) {
    const envExistContent = fs.readFileSync(path, 'utf-8');
    const envExist = parse(envExistContent);

    displayEnvInTable(envExist);

    await inquirer.prompt([
      {
        type: "message",
        message: `You already have ${path} variables. Do you want continue?`,
        name: "confirm"
      },
    ])
  }
}

export default program;
