import { createRequire } from 'module';
import fetch from 'node-fetch';
import { HttpsCookieAgent } from 'http-cookie-agent/http';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
class ConfigUtil {
  constructor(servicesToTest) {
    this.SERVICES = servicesToTest;
    const { HOSTNAME, DST_HOSTNAME, HA_VERSION, K8S_NAMESPACE, UIS_HOSTNAME } = process.env;
    this.haVersion = HA_VERSION;
    if (HOSTNAME) {
      this.INGRESS_SERVICE_URL = HOSTNAME;
      this.SERVICE_URL = `https://${HOSTNAME}`;
      this.DISCOVERED_INGRESS = `http://${HOSTNAME}/domainapp-eea-${K8S_NAMESPACE}`;
      this.DST_URL = `https://${DST_HOSTNAME}`;
      this.UIS_URL = `https://${UIS_HOSTNAME}`;
    } else {
      this.INGRESS_SERVICE_URL = 'http://localhost:3001';
      this.SERVICE_URL = 'http://localhost:3001';
      this.DISCOVERED_INGRESS = 'http://localhost/domainapp-eea-';
      this.DST_URL = `http://${DST_HOSTNAME}`;
    }

    this.APPS_RESP = [];
    this.GROUPS_RESP = [];
    this.COMPONENTS_RESP = [];

    this.initServices();
  }

  initServices() {
    this.SERVICES.forEach((serviceToTest) => {
      const configJson = JSON.parse(
        // eslint-disable-next-line import/no-dynamic-require
        JSON.stringify(require(`${serviceToTest.folderPath}/config.json`)),
      );

      // needed for groupMappings integration tests, update it based on the PCR and DROP chart values
      const index = configJson.apps?.findIndex((app) => app.name === 'charts');
      if (index > -1) {
        configJson.apps[index].groupNames.push('mock-group');
      }

      const appList = (configJson.apps ?? []).map((app) => ({
        ...app,
        ...(app.url
          ? { url: app.url.startsWith('/') ? `${this.DISCOVERED_INGRESS}${app.url}` : app.url }
          : undefined),
        service: serviceToTest.deploymentName,
      }));
      this.APPS_RESP = this.APPS_RESP.concat(appList);

      const componentList = (configJson.components ?? []).map((component) => ({
        ...component,
        service: serviceToTest.deploymentName,
      }));
      this.COMPONENTS_RESP = this.COMPONENTS_RESP.concat(componentList);

      this.GROUPS_RESP = this.GROUPS_RESP.concat(...(configJson.groups ?? []));
    });
  }

  async getCookies(userName, password) {
    const groupsUrl = `${this.getServiceUrl()}/ui-meta/v1/groups`;
    const loginPayload = { username: userName, password };

    const agent = new HttpsCookieAgent({
      keepAlive: true,
      rejectUnauthorized: false,
    });

    const dummyResponse = await fetch(groupsUrl, { method: 'GET', agent });

    const redirectResponse = await fetch(dummyResponse.url, { method: 'GET', agent });

    const data = await redirectResponse.text();
    const dom = new JSDOM(data);

    const AuthURL = dom.window.document.getElementById('kc-form-login').action;

    const loginResponse = await fetch(AuthURL, {
      redirect: 'manual',
      method: 'POST',
      agent,
      body: new URLSearchParams(loginPayload),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: [redirectResponse.headers.get('set-cookie')],
      },
    });

    const callbackResponse = await fetch(loginResponse.headers.get('location'), {
      method: 'GET',
      redirect: 'manual',
      agent,
    });

    return callbackResponse.headers.get('set-cookie');
  }

  getServiceUrl() {
    return this.SERVICE_URL;
  }

  getIngressURL() {
    return this.INGRESS_SERVICE_URL;
  }

  getAppsResponse() {
    return this.APPS_RESP;
  }

  getGroupsResponse() {
    return this.GROUPS_RESP;
  }

  getComponentResponse() {
    return this.COMPONENTS_RESP;
  }

  getDSTQueryUrl() {
    return this.DST_URL;
  }

  getUISUrl() {
    return this.UIS_URL;
  }
}

export default ConfigUtil;
