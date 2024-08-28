import euiFrame from '../common/eui-frame.component.js.js';

const cssPaths = {
  euiLoader: 'eui-loader',
  div: 'div',
};

class TreePage extends euiFrame.PageBase {
  async open(appURL) {
    await browser.url(`${browser.options.baseUrl}/#${appURL}`);
  }

  async root() {
    return this.content();
  }

  async text() {
    const root = await this.root();
    const div = await root.shadow$$(cssPaths.div);
    return div.innerText;
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

export default new TreePage();
