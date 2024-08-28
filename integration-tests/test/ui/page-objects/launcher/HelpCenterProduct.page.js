import PageBase from './Page.base.js';

const cssPaths = {
  helpCenterProductPage: 'e-help-center-product-page',
  productView: 'e-product-view',
  header1: 'h1',
  header2: 'h2',
};

class HelpCenterProductPage extends PageBase {
  async root() {
    const appContent = await this.content();
    const helpCenterProductPage = await appContent.$(cssPaths.helpCenterProductPage);
    return helpCenterProductPage.shadow$(cssPaths.productView);
  }

  async open(productName) {
    await browser.url(`${browser.options.baseUrl}/#help-center/product?productName=${productName}`);
  }

  async title() {
    const root = await this.root();
    const header1 = await root.shadow$(cssPaths.header1);
    return header1.getText();
  }

  async subtitle() {
    const root = await this.root();
    const header2 = await root.shadow$(cssPaths.header2);
    return header2.getText();
  }
}

export default new HelpCenterProductPage();
