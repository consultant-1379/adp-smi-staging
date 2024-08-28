// eslint-disable-next-line import/no-relative-packages
import constants from '../../../../../ci/scripts/configs/constants.js';

const cssPaths = {
  kcHeader: '#kc-header',
  formUname: '#username',
  formPwd: '#password',
  formButton: '#kc-login-input',
};

const { DEMO_USER_NAME, DEMO_USER_PASSWORD } = constants;

class LoginPage {
  async _isDisplayed(element) {
    try {
      return element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async root() {
    return $(cssPaths.kcHeader);
  }

  async login() {
    const loginUname = await $(cssPaths.formUname);
    await loginUname.setValue(DEMO_USER_NAME);
    const loginPwd = await $(cssPaths.formPwd);
    await loginPwd.setValue(DEMO_USER_PASSWORD);
    const loginButton = await $(cssPaths.formButton);
    await loginButton.click();
  }

  async waitForLoading() {
    await browser.waitUntil(
      async () => {
        const root = await this.root();
        return this._isDisplayed(root);
      },
      {
        timeoutMsg: `Failed to load login page`,
      },
    );
  }
}

export default new LoginPage();
