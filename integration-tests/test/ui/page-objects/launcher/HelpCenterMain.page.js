import PageBase from './Page.base.js';

const cssPaths = {
  helpCenterMainPage: 'e-help-center-main-page',
  mainView: 'e-main-view',
};

class HelpCenterMainPage extends PageBase {
  async root() {
    const appContent = await this.content();
    const helpCenterMainPage = await appContent.$(cssPaths.helpCenterMainPage);
    return helpCenterMainPage.shadow$(cssPaths.mainView);
  }

  async open() {
    await browser.url(`${browser.options.baseUrl}/#help-center`);
  }
}

export default new HelpCenterMainPage();
