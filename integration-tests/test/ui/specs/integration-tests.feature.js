import { createRequire } from 'module';
import * as chai from 'chai';
import chaiString from 'chai-string';
// eslint-disable-next-line import/no-relative-packages
import constants from '../../../../ci/scripts/configs/constants.js';
import LauncherPage from '../page-objects/launcher/Launcher.page.js';
import HelpCenterMainPage from '../page-objects/launcher/HelpCenterMain.page.js';
import HelpCenterProductPage from '../page-objects/launcher/HelpCenterProduct.page.js';
import HelpCenterDocumentPage from '../page-objects/launcher/HelpCenterDocument.page.js';
import LoginPage from '../page-objects/login/login.page.js';

chai.use(chaiString);

const require = createRequire(import.meta.url);
const launcherPageLocale = require('../page-objects/locales/launcher/en-us.json');
const contentAreaLocale = require('../page-objects/locales/content-area/en-us.json');

const { DEMO_USER_NAME } = constants;

const { expect } = chai;

const GROUPS = [
  'Documentation',
  'Mock Group',
  'Monitoring',
  'Network Analytics',
  'Others',
  'Performance and Optimization',
  'Subscriber Troubleshooting',
];

const GAS_DOCUMENTATION_TITLE = 'GUI Aggregator Service User Guide';

const EIC_DOCUMENT_TITLE = 'EIC System Administration Guide';

const EIC_DOCS_GROUP = 'EIC Configuration and Usage';

const HELP_CENTER = 'Help Center';

const PDF_DOCUMENT_FILE_NAME = 'some-administration-guide-pdf';

const PDF_DOCUMENT_TITLE = 'Some PDF Guide';

const OTHERS = 'Others';

async function findSpecificDocument(title, group) {
  await HelpCenterMainPage.open();
  await HelpCenterMainPage.waitForLoading();
  const mainArea = await HelpCenterMainPage.contentArea();
  const viewAllLink = await mainArea.viewAllLink();
  await viewAllLink.click();
  await HelpCenterProductPage.waitForLoading();
  const contentArea = await HelpCenterProductPage.contentArea();
  const documentCard = await contentArea.findSpecificCardForGroup(group, title);
  await documentCard.scrollIntoViewIfNeeded();
  await documentCard.click();
  await HelpCenterDocumentPage.waitForLoading();
}

describe('Integration Tests', () => {
  before(async () => {
    await LauncherPage.open();
    await LoginPage.waitForLoading();
    await LoginPage.login();

    await LauncherPage.waitForLoading();
  });

  it('can load GAS and open Help Center', async () => {
    await LauncherPage.open();
    await LauncherPage.waitForLoading();
    await LauncherPage.waitForProductViewLoading();
    await LauncherPage.clickAndWaitToDisplayMenuPanel();
    const navigationMenu = await LauncherPage.menuPanel();

    const titles = await navigationMenu.navigationTitles();
    const index = titles.findIndex((title) => title === launcherPageLocale.MENU.ALL);

    await navigationMenu.openNavigationItem(0);
    await navigationMenu.openRootElement();
    await navigationMenu.openNavigationItem(index);
    const appView = await LauncherPage.appView();
    await LauncherPage.waitForAppViewLoading();
    const appViewCards = await appView.cardContainers();
    const groups = await Promise.all(appViewCards.map((card) => card.groupName()));
    expect(groups.sort()).to.eql(GROUPS);
    const helpCard = await appView.findSpecificCardForGroup(OTHERS, HELP_CENTER);
    expect(helpCard).to.not.be.undefined;
    await helpCard.scrollIntoViewIfNeeded();
    await helpCard.click();
    await HelpCenterMainPage.waitForLoading();
    const contentArea = await HelpCenterMainPage.contentArea();
    expect(contentArea).to.exist;
  });

  it('can find GAS documentation in the Help Center', async () => {
    await findSpecificDocument(GAS_DOCUMENTATION_TITLE, contentAreaLocale.OTHERS);
    const gasDocText = await HelpCenterDocumentPage.getMDText();
    expect(gasDocText).to.include('GAS Light consists of the following components:');
  });

  it('can open a pdf document', async () => {
    await findSpecificDocument(PDF_DOCUMENT_TITLE, contentAreaLocale.ADMINISTRATIVE_GUIDE);
    const src = await HelpCenterDocumentPage.getNativeRendererSrc();
    expect(src).to.endWith(`${PDF_DOCUMENT_FILE_NAME}.md#view=fitH`);
  });

  it('can find an EIC document from the extended documentation image', async () => {
    await findSpecificDocument(EIC_DOCUMENT_TITLE, EIC_DOCS_GROUP);
    const eicDocText = await HelpCenterDocumentPage.getHTMLText();
    expect(eicDocText).to.include(
      '<span class="ph">Ericsson Intelligent Controller</span>&nbsp;&nbsp;is a wide-ranging automation environment for network',
    );
  });

  it('can open and use user panel', async () => {
    await LauncherPage.open();
    await LauncherPage.waitForLoading();
    let userSettingsPanel = await LauncherPage.settingsPanel();
    expect(await LauncherPage._isDisplayed(userSettingsPanel)).to.be.false;
    await LauncherPage.clickAndWaitToDisplaySettingsPanel();
    userSettingsPanel = await LauncherPage.settingsPanel();
    expect(await LauncherPage._isDisplayed(userSettingsPanel)).to.be.true;
    await LauncherPage.setLightTheme();
    expect(await LauncherPage.theme()).to.be.eq('light');
    await LauncherPage.setDarkTheme();
    expect(await LauncherPage.theme()).to.be.eq('dark');
  });

  it('can get userinfo', async () => {
    await browser.url(`https://${process.env.HOSTNAME}/userpermission/v1/userinfo`);
    const body = await $('body');
    const value = await body.getText();
    expect(value).to.include(`"upn":"${DEMO_USER_NAME}"`);
  });
});
