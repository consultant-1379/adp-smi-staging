import euiFrame from '../../common/eui-frame.component.js';
import ContentArea from './ContentArea.js';

const cssPaths = {
  contentArea: 'e-content-area',
  euiLoader: 'eui-loader',
};

class PageBase extends euiFrame.PageBase {
  async waitForContentAreaLoading() {
    await this._waitForLoading(cssPaths.contentArea);
  }

  async _waitForLoading(viewCssPath) {
    await super.waitForLoading();
    await browser.waitUntil(async () => {
      const root = await this.root();
      const view = await root.shadow$(viewCssPath);
      return this._isDisplayed(view);
    }, undefined);
  }

  async waitForLoading() {
    super.waitForLoading();
    await browser.waitUntil(
      async () => {
        const root = await this.root();
        const euiLoader = await root.shadow$(cssPaths.euiLoader);
        const isDisplayed = await this._isDisplayed(euiLoader);
        return !isDisplayed;
      },
      undefined,
      'Failed to wait for loader to disappear',
    );
  }

  async contentArea() {
    const root = await this.root();
    const contentArea = await root.shadow$(cssPaths.contentArea);
    return new ContentArea(contentArea);
  }
}

export default PageBase;
