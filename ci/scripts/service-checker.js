#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

/**

This script checks if the auto-discovery system found all the deployed mock services.
The microservices API is called on the given Ingress hostname and path, and compared with the
number of mock services. Checks MAX_TRIES times, and waits WAIT_INTERVAL seconds in between.

Usage:
  set HOSTNAME, AUTH_ENABLED, PROTOCOL, INGRESS_PATH env vars
  run: node service-checker.js
*/

// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'node-fetch';
import https from 'https';
import constants from './configs/constants.js';

const { HOSTNAME, AUTH_ENABLED, PROTOCOL, INGRESS_PATH } = process.env;

const { DEMO_USER_NAME, DEMO_USER_PASSWORD, CLIENT_ID, CLIENT_SECRET } = constants;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ingressPath = AUTH_ENABLED === 'true' ? '' : INGRESS_PATH;
const GAS_APPS_PATH = 'ui-meta/v1/apps';
const GAS_COMPONENTS_PATH = 'ui-meta/v1/components';
const GAS_GROUPS_PATH = 'ui-meta/v1/groups';
const GAS_PACKAGES_PATH = 'ui-serve/v1/list-packages';
const MAX_TRIES = 50;
const WAIT_INTERVAL = 10;

const cliArgs = process.argv.slice(2);

const requiredServices = cliArgs.map((serviceName) => serviceName.trim());

if (requiredServices.length === 0) {
  console.log(`Define the list of mockservices to wait for.`);
  process.exit(1);
}

let fetchOptions = { method: 'GET', headers: { 'Content-Type': 'application/json' } };

if (AUTH_ENABLED === 'true') {
  const options = {
    keepAlive: true,
    rejectUnauthorized: false, // In case of auth enabled the mTLS must be turned on. This will skip the cert validation.
    ALPNProtocols: ['http/1.1'], // Enable ALPN negotiation. For some server the TLS not working without ALPN
  };

  const tlsAgent = new https.Agent(options);

  const tokenResp = await fetch(
    `${PROTOCOL}://iam.${HOSTNAME}/auth/realms/oam/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      agent: tlsAgent,
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: DEMO_USER_NAME,
        password: DEMO_USER_PASSWORD,
      }),
    },
  );

  if (tokenResp.status > 204) {
    console.warn(`Access token request failed with status: ${tokenResp}`);
    process.exit(1);
  }

  const result = await tokenResp.json();
  const accessToken = result.access_token;

  fetchOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    agent: tlsAgent,
  };
}

const wait = (s) =>
  new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });

async function fetchEndpoints() {
  const appsEndpoint = `${PROTOCOL}://${HOSTNAME}${ingressPath}/${GAS_APPS_PATH}`;
  const componentsEndpoint = `${PROTOCOL}://${HOSTNAME}${ingressPath}/${GAS_COMPONENTS_PATH}`;
  const groupsEndpoint = `${PROTOCOL}://${HOSTNAME}${ingressPath}/${GAS_GROUPS_PATH}`;
  const packagesEndpoint = `${PROTOCOL}://${HOSTNAME}${ingressPath}/${GAS_PACKAGES_PATH}`;

  console.log('Apps endpoint: ', appsEndpoint);
  console.log('Components endpoint: ', componentsEndpoint);
  console.log('Groups endpoint: ', groupsEndpoint);
  console.log('Packages endpoint: ', packagesEndpoint);

  const fetchAPI = async (url, defaultValue) => {
    try {
      return await fetch(url, fetchOptions).then((r) => r.json());
    } catch (e) {
      return defaultValue;
    }
  };

  return {
    apps: await fetchAPI(appsEndpoint, []),
    components: await fetchAPI(componentsEndpoint, []),
    groups: await fetchAPI(groupsEndpoint, []),
    packages: await fetchAPI(packagesEndpoint, {}),
  };
}

let tries = 0;
let allRequiredServiceIsFound = false;

while (tries < MAX_TRIES && !allRequiredServiceIsFound) {
  console.log(`#${tries}. Fetching data from REST API...`);
  const result = await fetchEndpoints();
  console.log(result);
  const getServiceList = (resultPart) => resultPart.map((r) => r.service);

  const foundServices = [
    ...Object.keys(result.packages),
    ...getServiceList(result.apps),
    ...getServiceList(result.components),
    ...getServiceList(result.groups),
  ];

  const foundService = requiredServices.filter((service) => foundServices.includes(service));
  const notFoundService = requiredServices.filter((service) => !foundServices.includes(service));

  console.log(`Found services: ${foundService.join(',')}`);
  console.log(`Still missing services: ${notFoundService.join(',')}`);

  allRequiredServiceIsFound = notFoundService.length === 0;
  if (allRequiredServiceIsFound) {
    break;
  }

  tries += 1;
  console.log(
    `Discovery still in progress, sleeping for ${WAIT_INTERVAL} seconds. Elapsed time: ${
      tries * WAIT_INTERVAL
    }s`,
  );
  await wait(WAIT_INTERVAL);
}

if (allRequiredServiceIsFound) {
  console.log(`All services are found in time`);
  console.log(`Deployment ready, all mock services are discovered!`);
  process.exit(0);
} else {
  console.log(`Some services are not found in time`);
  console.log(`Deployment did not succeed in time!`);
  process.exit(1);
}
