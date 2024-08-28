// https://webdriver.io/docs/configurationfile.html

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_OPTIONS = 'goog:chromeOptions';
const ALLURE_FOLDER = 'test/ui/allure-results';

const DEBUG_MODE = process.env.DEBUG === 'debug';
const WITHOUT_BREAK = process.env.DEBUG === 'noBreak';
const INSPECT_PORT = 5859;
const FRONTEND_PATH = '/ui';
const execArgv =
  DEBUG_MODE || WITHOUT_BREAK
    ? [`${WITHOUT_BREAK ? '--inspect' : '--inspect-brk'}=127.0.0.1:${INSPECT_PORT}`]
    : [];

const getAbsolutePath = (...relativePath) => path.join(...[__dirname, '../', ...relativePath]);
const getAbsolutePaths = (paths) => paths.map((relativePath) => getAbsolutePath(relativePath));

// default values
const config = {
  debug: DEBUG_MODE,
  execArgv,
  specs: getAbsolutePaths(['./specs/**/*.feature.js']),
  maxInstances: 1,
  // set automationProtocol explicitly, otherwise chrome may switch to devtools protocol which breaks on our PageComponent pattern with shadow$
  automationProtocol: 'webdriver',
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'chrome',
      [CHROME_OPTIONS]: {
        args: ['--window-size=1920,1080', '--ignore-certificate-errors'],
        // prefs: {
        //     download: {
        //         default_directory: config.common.dockerDownloadDirectoryPath || config.common.downloadDirectoryPath
        //     }
        // }
      },
    },
  ],
  logLevel: 'warn', // Level of logging verbosity: trace | debug | info | warn | error | silent
  baseUrl: `http://localhost:3001${FRONTEND_PATH}`,
  mockServerUrl: 'http://localhost:3001',
  waitforTimeout: 3 * 10 * 1000,
  mochaOpts: {
    ui: 'bdd',
    timeout: 5 * 60 * 1000 * (DEBUG_MODE ? 100 : 1),
  },
  reporters: [], // set from additional configurations, see below
  onPrepare() {
    const allureOutputFolder = path.join(__dirname, '../..', ALLURE_FOLDER);
    if (fs.existsSync(allureOutputFolder)) {
      fs.readdirSync(allureOutputFolder).forEach((f) =>
        fs.unlinkSync(path.join(__dirname, '../../..', ALLURE_FOLDER, f)),
      );
    }
  },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
   * @param {Object} test test details
   */
  beforeTest(test) {
    if (!browser.__headless) {
      console.log(`Running test: ${test.title}`);
    }
  },
  async afterTest(test, context, { passed }) {
    if (!passed) {
      await browser.takeScreenshot();
    }
  },
};

// additional configurations based on the running mode

// process.env.npm_lifecycle_event == 'e2e:CI'  or
// process.argv.indexOf('--run-in-docker') or

process.argv.slice(3).forEach((arg, index, argv) => {
  switch (arg) {
    case '--local':
      config.baseUrl = `https://${process.env.HOSTNAME}${FRONTEND_PATH}`;
      config.mockServerUrl = `https://${process.env.HOSTNAME}`;
      config.capabilities[0].browserVersion = 'stable';
      break;
    case '--selenium-hub':
      // selenium hub and the controlled browser running in docker
      if (argv.indexOf('--local-mockserver') !== -1) {
        // in case the mockserver running outside of docker, on the host
        config.baseUrl = `http://host.docker.internal:8080${FRONTEND_PATH}`;
      }
      break;
    case '--ci':
      config.waitforTimeout *= 10;
      break;
    case '--local-mockserver':
    case '--spec':
      break;
    case '--network-config-from-env':
      config.hostname = process.env.SELENIUM_HOST;
      config.port = parseInt(process.env.SELENIUM_PORT, 10);
      config.path = '/wd/hub';
      config.baseUrl = `https://${process.env.HOSTNAME}${FRONTEND_PATH}`;
      config.mockServerUrl = `https://${process.env.HOSTNAME}`;
      break;
    case '--spec-reporter':
      config.reporters.push('spec');
      break;
    case '--allure-reporter':
      config.reporters.push([
        'allure',
        {
          outputDir: ALLURE_FOLDER,
          disableWebdriverScreenshotsReporting: false,
        },
      ]);
      break;
    default:
      console.log(`Unknown option: ${arg}`);
      break;
  }
});

export { config };
