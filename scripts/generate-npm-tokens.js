import https from 'https';
import fs from 'fs';

const { ARM_USER_SELI, ARM_TOKEN_SELI, ARM_USER_SERO, ARM_TOKEN_SERO } = process.env;

const armRndHost = 'https://arm.rnd.ki.sw.ericsson.se';
const armHost = 'https://arm.seli.gic.ericsson.se';
const authPath = '/artifactory/api/npm/auth';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
const options = {
  agent: httpsAgent,
};

const armUrl = new URL(`${armHost}${authPath}`);
armUrl.username = ARM_USER_SELI;
armUrl.password = ARM_TOKEN_SELI;

const armRndUrl = new URL(`${armRndHost}${authPath}`);
armRndUrl.username = ARM_USER_SERO;
armRndUrl.password = ARM_TOKEN_SERO;

const getToken = (url) =>
  new Promise((resolve, reject) => {
    let data = '';
    https
      .get(url, options, (res) => {
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const responseWithoutLines = data.replace(/(\r\n|\n|\r)/gm, ';');
          const responseObject = {};
          responseWithoutLines.split(';').forEach((line) => {
            const [key, value] = line.split(' = ');
            responseObject[key] = value;
          });
          resolve(responseObject);
        });
      })
      .on('error', (e) => {
        reject(e);
      });
  });

async function getTokens() {
  try {
    const { _auth: ARM_NPM_TOKEN } = await getToken(armUrl);
    const { _auth: RND_ARM_NPM_TOKEN } = await getToken(armRndUrl);
    if (!fs.existsSync(`.bob`)) {
      fs.mkdirSync(`.bob`, { recursive: true });
    }
    fs.writeFileSync('.bob/var.token', ARM_NPM_TOKEN);
    fs.writeFileSync('.bob/var.rnd-token', RND_ARM_NPM_TOKEN);
  } catch (e) {
    console.error(e);
  }
}

getTokens();
