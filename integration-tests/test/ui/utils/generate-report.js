import * as path from 'path';
import { execSync } from 'child_process';

const command =
  `${path.join('node_modules', '.bin', 'allure')}` +
  ` generate test/ui/allure-results` +
  ` --clean` +
  ` --report-dir test/ui/allure-report`;

console.log(`Executing command: ${command}`);

execSync(command, { stdio: 'inherit' });
