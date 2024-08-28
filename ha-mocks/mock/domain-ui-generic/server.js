import express from 'express';
import * as fs from 'fs';
import http from 'http';
import https from 'https';
import { createRequire } from 'module';
import * as path from 'path';
import chokidar from 'chokidar';

import telemetryService from './services/telemetryService.js';

const require = createRequire(import.meta.url);
const router = express.Router();

/*
 Generate cert:
 openssl genrsa -out server-key.pem 2048
 openssl req -new -key server-key.pem -out server-csr.pem
 openssl x509 -req -in server-csr.pem -signkey server-key.pem -out server-cert.pem
*/
const { MOCK_ID, TLS, PUBLIC_PATH, CONTEXT_ROOT } = process.env;
const MOCK_HELPCONTENT_BASEDIR = './mock-help-content';

// eslint-disable-next-line import/no-dynamic-require
const metadata = require(`./public/${PUBLIC_PATH}/help-content-metadata.json`);
let credentials = {};
let server;

if (TLS === 'true') {
  const getServerCredential = () => {
    const privateKey = fs.readFileSync('certificates/servercert/key.pem', 'utf8');
    const certificate = fs.readFileSync('certificates/servercert/cert.pem', 'utf8');
    const ca = [];
    const certAuth = fs.readFileSync('certificates/ca/ca.pem', 'utf8');
    ca.push(certAuth);
    try {
      const ingressClientCa = fs.readFileSync('certificates/ingress/ca.pem', 'utf8');
      ca.push(ingressClientCa);
    } catch (e) {
      console.log('Ingress CA is not available.');
    }
    return {
      key: privateKey,
      cert: certificate,
      ca,
      requestCert: true,
    };
  };

  credentials = getServerCredential();

  chokidar.watch('./certificates').on('all', (event, certPath) => {
    console.log('Certificates are changed, updating server secure context', event, certPath);
    server.setSecureContext(getServerCredential());
  });
}

const requestLogger = (req, res, next) => {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, '0');
  const formattedDate = `${pad(now.getFullYear())}-${pad(now.getMonth() + 1)}-${now.getDate()}`;
  const formattedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const { method, url } = req;
  res.on('finish', () => {
    const duration = (new Date() - now) / 1000;
    console.log(
      `[${formattedDate} ${formattedTime}][${MOCK_ID}] ${method}:${url} Status: ${res.statusCode} Duration: ${duration}`,
    );
  });
  next();
};

const dataHandler = (req, res) => {
  console.log(req.url);
  res.send(JSON.stringify({ data: `Some useful data from [${MOCK_ID}] Microservice.` }));
};

const port = 4000;
const app = express();

app.use(telemetryService.tracingMiddleware);

router.use(requestLogger);
router.get('/data', dataHandler);
router.use('/', express.static(`./public/${PUBLIC_PATH}/`));

while (metadata.files.length) {
  const file = metadata.files.pop();
  router.get(file.path, (req, res) => {
    const parsedPath = path.parse(file.path);
    const zipFileName = parsedPath.base;
    let zipFileContents;

    const archivedFilePath = path.join(MOCK_HELPCONTENT_BASEDIR, file.path);
    if (fs.existsSync(archivedFilePath)) {
      zipFileContents = fs.readFileSync(archivedFilePath);
    } else {
      return res.status(404).send(`File ${archivedFilePath} not found`);
    }

    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${zipFileName}"`,
      'Content-Type': 'application/zip',
    });
    return res.end(zipFileContents);
  });
}

app.use(CONTEXT_ROOT ? `/${CONTEXT_ROOT}` : '', router);

server = TLS === 'true' ? https.createServer(credentials, app) : http.createServer(app);
server.listen(port, () => {
  console.log(`Service [${MOCK_ID}] is running on port ${port} with contextroot ${CONTEXT_ROOT}`);
});
