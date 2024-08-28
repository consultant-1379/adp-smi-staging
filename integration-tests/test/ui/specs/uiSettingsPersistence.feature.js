import * as chai from 'chai';
import chaiString from 'chai-string';
import LoginPage from '../page-objects/login/login.page.js';
import LauncherPage from '../page-objects/launcher/Launcher.page.js';
import HelpCenterMainPage from '../page-objects/launcher/HelpCenterMain.page.js';

chai.use(chaiString);

const { expect } = chai;

const TILE = 'tile';
const LIST = 'list';
const LIGHT = 'light';
const DARK = 'dark';

const SAVE_DB_TIMEOUT = 5000;

const getContentArea = async () => {
  await HelpCenterMainPage.open();
  await HelpCenterMainPage.waitForLoading();

  const contentArea = await HelpCenterMainPage.contentArea();
  await HelpCenterMainPage.waitForContentAreaLoading();
  return contentArea;
};

describe('Integration Tests', () => {
  beforeEach(async () => {
    await browser.reloadSession();
    await LauncherPage.open();
    await LoginPage.waitForLoading();
    await LoginPage.login();

    await LauncherPage.waitForLoading();
  });

  it('can persist light theme', async () => {
    expect(await LauncherPage.theme()).to.be.eq(DARK);
    await LauncherPage.setLightTheme();
    expect(await LauncherPage.theme()).to.be.eq(LIGHT);

    await browser.pause(SAVE_DB_TIMEOUT); // wait for the setting save into DB
  });

  it('theme will remain light after reopening the browser', async () => {
    expect(await LauncherPage.theme()).to.be.eq(LIGHT);
  });

  it('HA can persist list view for documents', async () => {
    const contentArea = await getContentArea();

    const defaultViewType = await contentArea.viewTypeAttribute();
    expect(defaultViewType).to.eq(TILE);

    await contentArea.selectViewOption('List');

    const newViewType = await contentArea.viewTypeAttribute();
    expect(newViewType).to.eq(LIST);

    await browser.pause(SAVE_DB_TIMEOUT); // wait for the setting save into DB
  });

  it('documents will remain in list view after reopening the browser', async () => {
    const contentArea = await getContentArea();
    const viewType = await contentArea.viewTypeAttribute();
    expect(viewType).to.eq(LIST);
  });
});
