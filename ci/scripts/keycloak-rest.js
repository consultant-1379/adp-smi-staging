// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'node-fetch';
import * as https from 'https';
import constants from './configs/constants.js';

const { HOSTNAME, REALM, ADMIN_PASSWORD, NAMESPACE, SET_ROLE, CREATE_UIS_ADMIN } = process.env;

const {
  PROTOCOL,
  AUTH_REQ,
  ALL_IN_ONE_GAS,
  ALL_IN_ONE_UIS,
  UIS_ADMIN_ROLE,
  POST_METHOD,
  PUT_METHOD,
  GET_METHOD,
  URLENCODED_HEADER,
  REALMS_REQ,
  JSON_CONTENT_TYPE,
  DEMO_USER_NAME,
  DEMO_USER_PASSWORD,
  ADMIN_USER_NAME,
  ADMIN_USER_PASSWORD,
  CLIENT_CONFIG,
} = constants;

if (!HOSTNAME) {
  throw new Error('Hostname for keycloak rest api must be provided!');
}
if (!REALM) {
  throw new Error('Realm must be provided for keycloak rest api!');
}
if (!ADMIN_PASSWORD) {
  throw new Error('Password must be provided for keycloak!');
}
if (!NAMESPACE) {
  throw new Error('Namespace must be provided for keycloak!');
}

let accessToken;
let isRealmCreated = false;
let isDemoUserCreated = false;
let tlsAgent;

async function authKeycloak() {
  try {
    const resp = await fetch(`${PROTOCOL}://${HOSTNAME}/${AUTH_REQ}`, {
      method: POST_METHOD,
      headers: URLENCODED_HEADER,
      agent: tlsAgent,
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'admin',
        password: ADMIN_PASSWORD,
      }),
    });

    if (resp.status !== 200) {
      console.warn(`Request for authentication in keycloak returned with status ${resp.status}`);
      return Promise.resolve(false);
    }
    console.log('Successfully authenticated in keycloak!');
    const result = await resp.json();
    accessToken = result.access_token;
    return resp;
  } catch (error) {
    console.error(`Keycloak authentication failed: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

/**
 * Creates keycloak realm and credentials for demo.
 *
 * @throws {Error} If the params are missing.
 */
async function createDemoRealm() {
  try {
    const data = JSON.stringify({
      id: REALM,
      realm: REALM,
      enabled: true,
    });
    const resp = await fetch(`${PROTOCOL}://${HOSTNAME}/${REALMS_REQ}`, {
      method: POST_METHOD,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...JSON_CONTENT_TYPE,
        'Content-Length': data.length,
        accept: 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      },
      agent: tlsAgent,
      body: data,
    });

    if (resp.status !== 201) {
      console.warn(`Request for realm creation returned with status ${resp.status}`);
      return Promise.resolve(false);
    }
    isRealmCreated = true;
    console.log(`Realm ${REALM} successfully created!`);
    return resp;
  } catch (error) {
    console.error(`Realm creation failed: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

async function createIamUser(userName) {
  try {
    if (!isRealmCreated) {
      return Promise.resolve(false);
    }
    const resp = await fetch(`${PROTOCOL}://${HOSTNAME}/${REALMS_REQ}/${REALM}/users`, {
      method: POST_METHOD,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...JSON_CONTENT_TYPE,
      },
      agent: tlsAgent,
      body: JSON.stringify({ username: userName, emailVerified: true, enabled: true }),
    });

    if (resp.status !== 201) {
      console.warn(`Request for user creation returned with status ${resp.status}`);
      return Promise.resolve(false);
    }
    // User ID can be taken from 'location' header
    const location = resp.headers.get('location');
    isDemoUserCreated = true;
    console.log(`User ${DEMO_USER_NAME} successfully created!`);
    return location.slice(location.lastIndexOf('/') + 1);
  } catch (error) {
    console.error(`User creation failed: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

async function setPassword(userId, userPwd) {
  if (!isDemoUserCreated) {
    return Promise.resolve(false);
  }
  try {
    const resp = await fetch(
      `${PROTOCOL}://${HOSTNAME}/${REALMS_REQ}/${REALM}/users/${userId}/reset-password`,
      {
        method: PUT_METHOD,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...JSON_CONTENT_TYPE,
        },
        agent: tlsAgent,
        body: JSON.stringify({ type: 'password', value: userPwd, temporary: false }),
      },
    );

    if (resp.status !== 204) {
      console.warn(`Request for password setting returned with status ${resp.status}`);
      return Promise.resolve(false);
    }
    console.log(`Password for user ${DEMO_USER_NAME} successfully set!`);
    return resp;
  } catch (error) {
    console.error(`Password setting failed: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

async function getAvailableRoles(userId, roleName) {
  if (!userId) {
    return Promise.resolve(false);
  }
  try {
    const resp = await fetch(
      `${PROTOCOL}://${HOSTNAME}/${REALMS_REQ}/${REALM}/users/${userId}/role-mappings/realm/available`,
      {
        method: GET_METHOD,
        agent: tlsAgent,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...URLENCODED_HEADER,
        },
      },
    );

    if (resp.status !== 200) {
      console.warn(`Request for available roles returned with status ${resp.status}`);
      return Promise.resolve(false);
    }
    console.log(`Available roles successfully fetched!`);
    const roles = await resp.json();
    const userRole = roles.find((role) => role.name === roleName);
    if (!userRole) {
      console.log(`${roleName} role is not found!`);
      return roles;
    }
    return userRole;
  } catch (error) {
    console.error(`Request for available roles failed: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

async function assignUserRole(userId, roleId, roleName) {
  if (!roleId) {
    return Promise.resolve(false);
  }
  try {
    const resp = await fetch(
      `${PROTOCOL}://${HOSTNAME}/${REALMS_REQ}/${REALM}/users/${userId}/role-mappings/realm`,
      {
        method: POST_METHOD,
        agent: tlsAgent,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...JSON_CONTENT_TYPE,
        },
        body: JSON.stringify([
          {
            id: roleId,
            containerId: REALM,
            clientRole: false,
            composite: false,
            name: roleName,
          },
        ]),
      },
    );

    if (resp.status !== 204) {
      console.warn(`Request for role setting returned with status ${resp.status}`);
      return Promise.resolve(false);
    }
    console.log(`'${roleName}' role successfully assigned!`);
    return resp;
  } catch (error) {
    console.error(`Request for role setting failed: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

async function getUserId(userName) {
  try {
    const resp = await fetch(`${PROTOCOL}://${HOSTNAME}/${REALMS_REQ}/${REALM}/users`, {
      method: GET_METHOD,
      agent: tlsAgent,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...URLENCODED_HEADER,
      },
    });

    if (resp.status !== 200) {
      console.warn(`Request for demo users returned with status ${resp.status}`);
      return Promise.resolve(false);
    }
    const demoUsers = await resp.json();
    let userId;

    if (demoUsers || demoUsers?.length) {
      const user = demoUsers.find((demoUser) => demoUser.username === userName);
      userId = user.id;
    }
    if (!userId) {
      console.log(`Demo user is not found!`);
      return Promise.resolve(false);
    }

    console.log(`Demo users successfully fetched!`);
    return userId;
  } catch (error) {
    console.error(`Request for demo users failed: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

async function createClient() {
  try {
    const clientResp = await fetch(`${PROTOCOL}://${HOSTNAME}/${REALMS_REQ}/oam/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      agent: tlsAgent,
      body: JSON.stringify(CLIENT_CONFIG),
    });

    if (clientResp.status === 409) {
      console.warn('Client already created');
      return Promise.resolve(false);
    }

    if (clientResp.status > 204 && clientResp.status !== 409) {
      console.warn(`Failed to create client: ${clientResp.status}`);
      return Promise.resolve(false);
    }

    console.log('Client successfully created!');
    return clientResp;
  } catch (error) {
    console.error(`Failed to create Client: ${error.name} - ${error.message}.`);
    return Promise.resolve(false);
  }
}

const options = {
  keepAlive: true,
  rejectUnauthorized: false,
  ALPNProtocols: ['http/1.1'], // Enable ALPN negotiation. For some server the TLS not working without ALPN
};
tlsAgent = new https.Agent(options);

await authKeycloak();

if (accessToken && SET_ROLE === 'false') {
  await createDemoRealm();
  const demoUserID = await createIamUser(DEMO_USER_NAME);
  await setPassword(demoUserID, DEMO_USER_PASSWORD);
  const adminUserID = await createIamUser(ADMIN_USER_NAME);
  await setPassword(adminUserID, ADMIN_USER_PASSWORD);
}

// Create gas user
if (accessToken && SET_ROLE === 'true') {
  const demoUserID = await getUserId(DEMO_USER_NAME);
  const gasRole = await getAvailableRoles(demoUserID, ALL_IN_ONE_GAS);
  const uisRole = await getAvailableRoles(demoUserID, ALL_IN_ONE_UIS);
  await assignUserRole(demoUserID, gasRole.id, gasRole.name);
  await assignUserRole(demoUserID, uisRole.id, uisRole.name);
  await createClient();
}

// Create admin user
if (accessToken && CREATE_UIS_ADMIN === 'true') {
  const demoUserID = await getUserId(DEMO_USER_NAME);
  const uisRole = await getAvailableRoles(demoUserID, ALL_IN_ONE_UIS);
  await assignUserRole(demoUserID, uisRole.id, uisRole.name);
  const adminUserID = await getUserId(ADMIN_USER_NAME);
  const gasRole = await getAvailableRoles(adminUserID, ALL_IN_ONE_GAS);
  const adminRole = await getAvailableRoles(adminUserID, UIS_ADMIN_ROLE);
  await assignUserRole(adminUserID, gasRole.id, gasRole.name);
  await assignUserRole(adminUserID, uisRole.id, uisRole.name);
  await assignUserRole(adminUserID, adminRole.id, adminRole.name);
}
