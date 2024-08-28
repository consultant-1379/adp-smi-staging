import euiFrame from '../../common/eui-frame.component.js';
import IFrame from './IFrame.js';

const cssPaths = {
  wrapperApp: 'e-wrapper-app',
  iframe: 'iframe',
  euiLoader: 'eui-loader',
};

class WrapperApp extends euiFrame.PageBase {
  async root() {
    const content = await this.content();
    return content.shadow$(cssPaths.wrapperApp);
  }

  async iframe() {
    const root = await this.root();
    const iframe = await root.shadow$(cssPaths.iframe);
    return new IFrame(iframe);
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
      {
        timeoutMsg: 'Failed to wait for loader to disappear',
      },
    );
  }
}

export default new WrapperApp();
