import euiFrame from '../common/eui-frame.component.js.js';

const cssPaths = {
  checkboxesContainer: 'e-checkboxes',
  checkboxComponent: 'eui-checkbox',
  euiLoader: 'eui-loader',
};

class CheckboxesPage extends euiFrame.PageBase {
  async root() {
    const content = await this.content();
    return content.$(cssPaths.checkboxesContainer);
  }

  async checkboxes() {
    const root = await this.root();
    return root.shadow$$(cssPaths.checkboxComponent);
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

export default new CheckboxesPage();
