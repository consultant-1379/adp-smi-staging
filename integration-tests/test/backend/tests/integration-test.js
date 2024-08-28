import { expect } from 'chai';
import fetch from 'node-fetch';
import https from 'https';
// eslint-disable-next-line import/no-relative-packages
import constants from '../../../../ci/scripts/configs/constants.js';
import sortFn from '../util/sort-util.js';
import ConfigUtilClass from '../util/config-util.js';

const { DEMO_USER_NAME, DEMO_USER_PASSWORD, ADMIN_USER_NAME, ADMIN_USER_PASSWORD } = constants;

const MOCK_BASE = '../fixtures/mocks';
const FRONTEND_BASE = '../fixtures/gas';
const GAS_SVC_NAME = 'eric-adp-gui-aggregator-service';
const HA_SVC_NAME = 'eric-oss-help-aggregator';
// Delay between request to GAS and to DST Query. It is required because traces from GAS and HA must
// first be sent to the DST Collector, and only after that they could be requested via DST Query
const DST_REQUEST_DELAY = 10000;
const DST_TEST_TIMEOUT = 5000 + DST_REQUEST_DELAY; // default test case timeout from mocharc.cjs + delay for DST query
const UI_SETTINGS_DELAY = 5000;
const UIS_TEST_TIMEOUT = 5000 + UI_SETTINGS_DELAY;
const PERMISSIONS = 'permissions';
const DECISION = 'decision';
const SCOPES = ['TRACE', 'HEAD', 'DELETE', 'POST', 'GET', 'CONNECT', 'OPTIONS', 'PUT'];

const servicesToTest = [
  {
    deploymentName: 'demo-ui-service-esmb',
    folderPath: `${MOCK_BASE}`,
    filesToCheck: ['config.json', 'config.package.json'],
  },
  {
    deploymentName: 'eric-adp-gui-aggregator-service',
    folderPath: `${FRONTEND_BASE}`,
    filesToCheck: ['config.json', 'config.package.json'],
  },
];

const configUtil = new ConfigUtilClass(servicesToTest);

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('ADP SMI Staging tests', () => {
  let tlsAgent;
  let serviceURL;
  let gasUserCookie;
  let UISAdminCookie;

  before(async () => {
    serviceURL = configUtil.getServiceUrl();
    tlsAgent = new https.Agent({
      keepAlive: true,
      rejectUnauthorized: false,
    });
    gasUserCookie = await configUtil.getCookies(DEMO_USER_NAME, DEMO_USER_PASSWORD);
    UISAdminCookie = await configUtil.getCookies(ADMIN_USER_NAME, ADMIN_USER_PASSWORD);
  });

  it('Discovered deployed components', async () => {
    const COMPONENT_RESP = configUtil.getComponentResponse();
    const response = await fetch(`${serviceURL}/ui-meta/v1/components`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Cookie: gasUserCookie },
      agent: tlsAgent,
    });
    const components = await response.json();
    expect(components.sort(sortFn('service'))).to.deep.eq(COMPONENT_RESP.sort(sortFn('service')));
  });

  it('Can get user info', async () => {
    const response = await fetch(`${serviceURL}/userpermission/v1/userinfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: gasUserCookie,
      },
      agent: tlsAgent,
    });
    const userinfo = await response.json();
    expect(userinfo.sub).to.exist;
    expect(userinfo.lastLoginTime).to.exist;
    expect(userinfo.username).to.eq(DEMO_USER_NAME);
  });

  it('Can get realm user info', async () => {
    const response = await fetch(`${serviceURL}/userpermission/v1/oam/userinfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: gasUserCookie,
      },
      agent: tlsAgent,
    });
    const userinfo = await response.json();
    expect(userinfo.sub).to.exist;
    expect(userinfo.lastLoginTime).to.exist;
    expect(userinfo.username).to.eq(DEMO_USER_NAME);
  });

  it('Can get user permission with decision parameter', async () => {
    const response = await fetch(`${serviceURL}/userpermission/v1/permission`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: gasUserCookie,
      },
      agent: tlsAgent,
      body: JSON.stringify({
        response_mode: DECISION,
        permission: ['all-in-one-gas_eric-adp-gui-aggregator-service-authproxy'],
      }),
    });
    const responseJSON = await response.json();

    expect(responseJSON).to.deep.eq({ result: true });
  });

  it('Can handle if the user cannot access the given resource', async () => {
    const response = await fetch(`${serviceURL}/userpermission/v1/permission`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: gasUserCookie,
      },
      agent: tlsAgent,
      body: JSON.stringify({
        response_mode: DECISION,
        permission: ['not_existing_resource'],
      }),
    });
    const responseJSON = await response.json();

    expect(responseJSON).to.deep.eq({ result: false });
  });

  it('Can get user permission with permissions parameter', async () => {
    const response = await fetch(`${serviceURL}/userpermission/v1/permission`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: gasUserCookie,
      },
      agent: tlsAgent,
      body: JSON.stringify({
        response_mode: PERMISSIONS,
      }),
    });
    const responseJSON = await response.json();

    const gasResource = responseJSON.find(
      (resource) => resource.rsname === 'all-in-one-gas_eric-adp-gui-aggregator-service-authproxy',
    );

    expect(gasResource.scopes.sort()).to.deep.eq(SCOPES.sort());
    expect(gasResource.rsid).to.exist;
  });

  describe('Check DST services are integrated properly', () => {
    const generateExpectedTraceData = (gasHAStaticFileUrlPart, haStaticFileUrl) => ({
      spans: [
        {
          operationName: `GET /ui-serve/v1/static/${gasHAStaticFileUrlPart}`,
          processID: 'p1',
        },
        {
          operationName: `GET /${gasHAStaticFileUrlPart}`,
          processID: 'p1',
        },
        {
          operationName: `GET ${haStaticFileUrl}`,
          processID: 'p2',
        },
      ],
      processes: {
        p1: {
          serviceName: GAS_SVC_NAME,
        },
        p2: {
          serviceName: HA_SVC_NAME,
        },
      },
    });

    // eslint-disable-next-line func-names, prefer-arrow-callback
    it('Check DST services collects full trace', async () => {
      const TRACE_LIMIT = 1;
      const TRACE_LOOKBACK = '5m';
      const startTime = new Date().getTime() * 1000; // in microseconds
      const gasHAStaticFileUrlPart = `${HA_SVC_NAME}-${configUtil.haVersion}/src/apps/help-center-main-page/help-center-main-page.js`;
      const haStaticFileUrl = `/ui/${gasHAStaticFileUrlPart.split('/').slice(1).join('/')}`;
      const gasRequestURL = `${serviceURL}/ui-serve/v1/static/${gasHAStaticFileUrlPart}`;
      const dstQueryRequestURL = `${configUtil.getDSTQueryUrl()}/api/traces?limit=${TRACE_LIMIT}&lookback=${TRACE_LOOKBACK}&service=${HA_SVC_NAME}&operation=GET%20${haStaticFileUrl}&start=${startTime}`;
      const expectedTraceData = generateExpectedTraceData(gasHAStaticFileUrlPart, haStaticFileUrl);

      const gasResponse = await fetch(gasRequestURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: gasUserCookie,
        },
        agent: tlsAgent,
      });
      expect(gasResponse.status).to.be.eq(200);

      await wait(DST_REQUEST_DELAY);

      const dstTracingResponse = await fetch(dstQueryRequestURL);
      expect(dstTracingResponse.status).to.be.eq(200);

      const dstTrace = (await dstTracingResponse.json()).data[0];
      expect(dstTrace).to.not.be.undefined;

      Object.entries(dstTrace.processes).forEach(([processName, processDetails]) => {
        expect(processDetails).to.include(expectedTraceData.processes[processName]);
      });
      dstTrace.spans.forEach((span, index) => {
        expect(span).to.include(expectedTraceData.spans[index]);
      });
    }).timeout(DST_TEST_TIMEOUT);
  });

  describe('Test UI-Settings Service', async () => {
    let timeDiff;

    const UI_SETTINGS_BASE_PATH = '/ui-settings/v1';
    const UIS_URL = configUtil.getUISUrl();

    const BULK_USER_SETTINGS_ARRAY = [
      { name: 'first', value: 'first_value' },
      { name: 'second', value: 'second_value' },
    ];
    const BULK_ADMIN_SETTINGS_ARRAY = [
      {
        name: 'first',
        value: 'admin_value',
      },
    ];

    const getSettings = async (Cookie, path) => {
      const response = await fetch(`${UIS_URL}${UI_SETTINGS_BASE_PATH}/settings/${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie,
        },
        agent: tlsAgent,
      });

      const responseContent = response.headers.get('content-type').includes('application/json')
        ? await response.json()
        : await response.text();
      return {
        content: responseContent,
        status: response.status,
      };
    };

    const createSettings = async (Cookie, path, settings) => {
      const response = await fetch(`${UIS_URL}${UI_SETTINGS_BASE_PATH}/settings/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie,
        },
        agent: tlsAgent,
        body: JSON.stringify(settings),
      });

      const responseContent = response.headers.get('content-type').includes('application/json')
        ? await response.json()
        : await response.text();
      return {
        content: responseContent,
        status: response.status,
      };
    };

    const deleteSettings = async (Cookie, path) =>
      fetch(`${UIS_URL}${UI_SETTINGS_BASE_PATH}/settings/${path}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie,
        },
        agent: tlsAgent,
      });

    const cleanupSettingsDuration = async (Cookie, duration) => {
      const response = await fetch(`${UIS_URL}${UI_SETTINGS_BASE_PATH}/cleanup/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie,
        },
        agent: tlsAgent,
        body: JSON.stringify({ age: duration }),
      });

      const responseContent = response.headers.get('content-type').includes('application/json')
        ? await response.json()
        : await response.text();
      return {
        content: responseContent,
        status: response.status,
      };
    };

    const cleanupSettingsDateTime = async (Cookie, dateTime) => {
      const response = await fetch(`${UIS_URL}${UI_SETTINGS_BASE_PATH}/cleanup/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie,
        },
        agent: tlsAgent,
        body: JSON.stringify({ dateTime }),
      });

      const responseContent = response.headers.get('content-type').includes('application/json')
        ? await response.json()
        : await response.text();
      return {
        content: responseContent,
        status: response.status,
      };
    };

    const cleanupUser = async (Cookie, userName) =>
      fetch(`${UIS_URL}${UI_SETTINGS_BASE_PATH}/cleanup/users/${userName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie,
        },
        agent: tlsAgent,
      });

    const getTimeDiff = async () => {
      await createSettings(gasUserCookie, 'user/get.time.diff/what_time_is_it', {
        name: 'what_time_is_it',
        value: 'lets_find_out',
      });
      const now = new Date();
      await wait(2000);

      const cleanupResponse = await cleanupSettingsDuration(UISAdminCookie, 'PT0S');

      const lastAccessed = new Date(cleanupResponse.content[0].lastAccessed);

      timeDiff = Date.parse(lastAccessed) - Date.parse(now.toISOString());
    };

    before(async () => {
      await getTimeDiff();
    });

    beforeEach(async () => {
      await cleanupSettingsDuration(UISAdminCookie, 'PT0S');
      await deleteSettings(UISAdminCookie, 'admin/ns');
      await wait(1000);
    });

    it('can create settings', async () => {
      const createUserSettingsResponse = await createSettings(gasUserCookie, 'user/ns', {
        settings: BULK_USER_SETTINGS_ARRAY,
      });
      expect(createUserSettingsResponse.content).to.deep.eq({
        settings: BULK_USER_SETTINGS_ARRAY,
      });

      const createAdminSettingsResponse = await createSettings(UISAdminCookie, 'admin/ns', {
        settings: BULK_ADMIN_SETTINGS_ARRAY,
      });
      expect(createAdminSettingsResponse.content).to.deep.eq({
        settings: BULK_ADMIN_SETTINGS_ARRAY,
      });
    });

    it('can get settings', async () => {
      await createSettings(gasUserCookie, 'user/ns', {
        settings: BULK_USER_SETTINGS_ARRAY,
      });
      await createSettings(UISAdminCookie, 'admin/ns', {
        settings: BULK_ADMIN_SETTINGS_ARRAY,
      });

      const getUserSettingsResponse = await getSettings(gasUserCookie, 'user/ns');
      expect(getUserSettingsResponse.content.settings.length).to.eq(2);

      const getSingleSettingResponse = await getSettings(gasUserCookie, 'user/ns/first');
      expect(getSingleSettingResponse.content).to.deep.eq({
        name: 'first',
        value: 'first_value',
      });

      const getAdminSettingsResponse = await getSettings(UISAdminCookie, 'admin/ns');
      expect(getAdminSettingsResponse.content.settings).to.deep.eq(BULK_ADMIN_SETTINGS_ARRAY);
    });

    it('can delete settings', async () => {
      const deleteUserSettingsResponse = await deleteSettings(gasUserCookie, 'user/ns');
      expect(deleteUserSettingsResponse.status).to.eq(204);

      const deleteOneSettingResponse = await deleteSettings(UISAdminCookie, 'admin/ns/first');
      expect(deleteOneSettingResponse.status).to.eq(204);
    });

    it('can cleanup settings by duration', async () => {
      await createSettings(gasUserCookie, 'user/ns', { settings: BULK_USER_SETTINGS_ARRAY });
      await wait(UI_SETTINGS_DELAY);

      const now = new Date();
      const correctedDateTime = new Date(Date.parse(now.toISOString()) + timeDiff);

      const cleanupResponse = await cleanupSettingsDuration(UISAdminCookie, 'PT0S');
      expect(cleanupResponse.content[0].username).to.eq(DEMO_USER_NAME);
      expect(new Date(cleanupResponse.content[0].lastAccessed)).to.be.below(correctedDateTime);

      const getGasUserSettings = await getSettings(gasUserCookie, 'user/ns');
      expect(getGasUserSettings.content.code).to.eq('adp.error.setting.notFound');
    }).timeout(UIS_TEST_TIMEOUT);

    it('can cleanup settings by dateTime', async () => {
      await createSettings(gasUserCookie, 'user/ns', { settings: BULK_USER_SETTINGS_ARRAY });
      await wait(UI_SETTINGS_DELAY);

      const now = new Date();
      const correctedDateTime = new Date(Date.parse(now.toISOString()) + timeDiff);

      const cleanupResponse = await cleanupSettingsDateTime(
        UISAdminCookie,
        correctedDateTime.toISOString(),
      );
      expect(cleanupResponse.content[0].username).to.eq(DEMO_USER_NAME);

      const getGasUserSettings = await getSettings(gasUserCookie, 'user/ns');
      expect(getGasUserSettings.content.code).to.eq('adp.error.setting.notFound');
    }).timeout(UIS_TEST_TIMEOUT);

    it('cleanup will keep admin setting', async () => {
      await createSettings(UISAdminCookie, 'admin/ns', { settings: BULK_ADMIN_SETTINGS_ARRAY });
      await wait(UI_SETTINGS_DELAY);

      const now = new Date();
      const correctedDateTime = new Date(Date.parse(now.toISOString()) + timeDiff);

      const cleanupResponseByDuration = await cleanupSettingsDuration(UISAdminCookie, 'PT0S');
      expect(cleanupResponseByDuration.status).to.eq(200);

      const cleanupResponseByDateTime = await cleanupSettingsDateTime(
        UISAdminCookie,
        correctedDateTime.toISOString(),
      );
      expect(cleanupResponseByDateTime.status).to.eq(200);

      const getAdminUserSettings = await getSettings(UISAdminCookie, 'admin/ns');
      expect(getAdminUserSettings.content.settings).to.deep.eq(BULK_ADMIN_SETTINGS_ARRAY);
    }).timeout(UIS_TEST_TIMEOUT);

    it('can cleanup user', async () => {
      await createSettings(gasUserCookie, 'user/ns', { settings: BULK_USER_SETTINGS_ARRAY });

      const cleanupResponse = await cleanupUser(UISAdminCookie, DEMO_USER_NAME);
      expect(cleanupResponse.status).to.eq(204);

      const getGasUserSettings = await getSettings(gasUserCookie, 'user/ns');
      expect(getGasUserSettings.content.code).to.eq('adp.error.setting.notFound');
    });

    it('cleanup API is only reachable with admin role', async () => {
      await createSettings(gasUserCookie, 'user/ns', { settings: BULK_USER_SETTINGS_ARRAY });

      const cleanupUserResponse = await cleanupUser(gasUserCookie, DEMO_USER_NAME);
      expect(cleanupUserResponse.status).to.eq(403);

      const cleanupResponseByAge = await cleanupSettingsDuration(gasUserCookie, 'PT0S');
      expect(cleanupResponseByAge.status).to.eq(403);

      const now = new Date();
      const correctedDateTime = new Date(Date.parse(now.toISOString()) + timeDiff);

      const cleanupResponseByDateTime = await cleanupSettingsDateTime(
        gasUserCookie,
        correctedDateTime.toISOString(),
      );
      expect(cleanupResponseByDateTime.status).to.eq(403);
    });
  });
});
