/* eslint max-classes-per-file: "off" */

const cssPaths = {
  euiContainer: 'eui-container',
  euiSystembarActions: 'eui-system-bar-actions',
  euiSystembarUserInfo: 'e-systembar-user-info',
  euiSystembarTitle: 'e-systembar-title',
  euiAppBar: 'eui-app-bar',
  euiAppBarMenuToggle: '#menu-toggle',
  euiAppBarBreadcrumb: 'eui-app-bar-breadcrumb',
  euiSystemPanel: 'eui-system-panel',
  euiNavigationMenu: 'eui-navigation-menu',
  euiNavigationGroup: 'eui-navigation-group',
  euiNavigationItem: 'eui-navigation-item',
  euiSwitch: 'eui-switch',
  euiIcon: 'eui-icon',
  edsIcon: 'eds-icon',
  euiButton: 'eui-button',
  euiTheme: 'eui-theme',
  navItem: '#nav-item',
  customUserSettingsPanel: 'e-custom-user-settings-panel',
  usericon: 'eui-icon[name = "profile"]',
  span: 'span',
  username: '.username',
  logintText: '#loginText',
  settings: '.settings',
  title: '.title',
  panelTitle: '.systempanel-title',
  content: '.content',
};

const GROUP_BUTTON_CHEVRON_OFFSET = 50;
const GROUP_BUTTON_TOP_OFFSET = 10;

class SystemBar {
  async container() {
    return $(cssPaths.euiContainer);
  }

  async systemBarActions() {
    const container = await this.container();
    return container.$(cssPaths.euiSystembarActions);
  }

  async systembarUserInfo() {
    const systemBarActions = await this.systemBarActions();
    return systemBarActions.$(cssPaths.euiSystembarUserInfo);
  }

  async userName() {
    const systembarUserInfo = await this.systembarUserInfo();
    return systembarUserInfo.shadow$(cssPaths.span);
  }

  async userIcon() {
    const systembarUserInfo = await this.systembarUserInfo();
    return systembarUserInfo.shadow$(cssPaths.usericon);
  }

  async systemBarTitleComponent() {
    const container = await this.container();
    return container.$(cssPaths.euiSystembarTitle);
  }
}

class SettingsPanel {
  constructor(root) {
    this.root = root;
  }

  async waitForLoading() {
    await browser.waitUntil(async () => this.isDisplayedInViewport(), {
      timeoutMsg: 'Failed to load settings panel',
    });
  }

  async isDisplayedInViewport() {
    return this.root.isDisplayedInViewport();
  }

  async isDisplayed() {
    return this.root.isDisplayed();
  }

  async themeSwitcher() {
    return this.root.shadow$(cssPaths.euiSwitch);
  }

  async signoutButton() {
    return this.root.shadow$(cssPaths.euiButton);
  }

  async username() {
    const userName = await this.root.shadow$(cssPaths.username);
    return userName.getText();
  }

  async loginText() {
    const loginText = await this.root.shadow$(cssPaths.logintText);
    return loginText.getText();
  }
}

class MenuPanel {
  constructor(root) {
    this.root = root;
  }

  async waitForLoading() {
    await browser.waitUntil(async () => this.isDisplayedInViewport(), {
      timeoutMsg: 'Failed to load menu panel',
    });
  }

  async isDisplayedInViewport() {
    return this.root.isDisplayedInViewport();
  }

  async navMenuPanel() {
    const container = await $(cssPaths.euiContainer);
    return container.$(cssPaths.euiNavigationMenu);
  }

  async navigationGroup() {
    const navMenuPanel = await this.navMenuPanel();
    return navMenuPanel.shadow$$(cssPaths.euiNavigationGroup);
  }

  async navigationItems() {
    const navMenuPanel = await this.navMenuPanel();
    const items = await navMenuPanel.shadow$$(cssPaths.euiNavigationItem);
    return [...items];
  }

  async waitForHide() {
    await browser.waitUntil(async () => !(await this.isDisplayed()), {
      timeoutMsg: 'Failed to hide menu panel',
    });
  }

  async navigationTitles() {
    const navigationItems = await this.navigationItems();
    return Promise.all(navigationItems.map((item) => item.getAttribute('label')));
  }

  async openNavigationItem(index) {
    const navigationItems = await this.navigationItems();
    const navItem = await navigationItems[index].shadow$(cssPaths.navItem);
    return navItem.click({ x: GROUP_BUTTON_CHEVRON_OFFSET, y: GROUP_BUTTON_TOP_OFFSET });
  }

  async openRootElement() {
    const navigationItems = await this.navigationItems();
    const rootElement = navigationItems[0];
    if ((await rootElement.getAttribute('open')) !== '') {
      const icon = await navigationItems[0].shadow$(cssPaths.euiIcon);
      icon.click();
    }
  }

  async activeNavigationItem() {
    const navigationItems = await this.navigationItems();
    const activeAttributes = await Promise.all(
      navigationItems.map((item) => item.getAttribute('active')),
    );
    const index = activeAttributes.findIndex((attribute) => attribute === '');
    return navigationItems[index];
  }
}
class SystemPanel {
  constructor(root) {
    this.root = root;
  }

  async panelTitle() {
    const panelTitle = await this.root.shadow$(cssPaths.panelTitle);
    return panelTitle.getText();
  }
}

class Breadcrumb {
  constructor(root) {
    this.root = root;
  }

  async list() {
    return this.root.shadow$$(cssPaths.span);
  }

  async hierarchy() {
    const list = await this.list();
    return Promise.all(list.map((element) => element.getText()));
  }
}

class PageBase {
  async theme() {
    const theme = await $(cssPaths.euiTheme);
    return theme.getAttribute('theme');
  }

  get systemBar() {
    return new SystemBar();
  }

  async appBar() {
    const container = await $(cssPaths.euiContainer);
    return container.shadow$(cssPaths.euiAppBar);
  }

  async breadcrumb() {
    const appBar = await this.appBar();
    const breadcrumb = await appBar.shadow$(cssPaths.euiAppBarBreadcrumb);
    return new Breadcrumb(breadcrumb);
  }

  async settingsPanel() {
    const container = await $(cssPaths.euiContainer);
    const systemPanel = await container.shadow$(cssPaths.euiSystemPanel);
    const settingsPanel = await systemPanel.$(cssPaths.customUserSettingsPanel);
    return new SettingsPanel(settingsPanel);
  }

  async menuPanel() {
    const container = await $(cssPaths.euiContainer);
    const menuPanel = await container.$(cssPaths.euiNavigationMenu);
    return new MenuPanel(menuPanel);
  }

  async systemPanel() {
    const container = await $(cssPaths.euiContainer);
    const systemPanel = await container.shadow$(cssPaths.euiSystemPanel);
    return new SystemPanel(systemPanel);
  }

  async menuToggle() {
    const appBar = await this.appBar();
    return appBar.shadow$(cssPaths.euiAppBarMenuToggle);
  }

  async content() {
    const container = await $(cssPaths.euiContainer);
    return container.shadow$(cssPaths.content);
  }

  async clickAndWaitToDisplayMenuPanel() {
    const menuPanel = await this.menuPanel();
    if (!(await menuPanel.isDisplayedInViewport())) {
      const appBar = await this.appBar();
      const menuToggle = await appBar.shadow$(cssPaths.euiAppBarMenuToggle);
      await menuToggle.click();
      await menuPanel.waitForLoading();
    }
  }

  async clickAndWaitToHideMenuPanel() {
    const menuPanel = await this.menuPanel();
    if (await menuPanel.isDisplayedInViewport()) {
      const appBar = await this.appBar();
      const menuToggle = await appBar.shadow$(cssPaths.euiAppBarMenuToggle);
      await menuToggle.click();
      await menuPanel.waitForHide();
    }
  }

  async clickAndWaitToDisplaySettingsPanel() {
    const settingsPanel = await this.settingsPanel();
    if (!(await settingsPanel.isDisplayed())) {
      const userIcon = await this.systemBar.userIcon();
      await userIcon.click();
      await settingsPanel.waitForLoading();
    }
  }

  async setDarkTheme() {
    await this.clickAndWaitToDisplaySettingsPanel();
    if ((await this.theme()) !== 'dark') {
      const settingsPanel = await this.settingsPanel();
      const themeSwitcher = await settingsPanel.themeSwitcher();
      await themeSwitcher.click();
    }
  }

  async setLightTheme() {
    await this.clickAndWaitToDisplaySettingsPanel();
    if ((await this.theme()) !== 'light') {
      const settingsPanel = await this.settingsPanel();
      const themeSwitcher = await settingsPanel.themeSwitcher();
      await themeSwitcher.click();
    }
  }

  async clickSignout() {
    await this.clickAndWaitToDisplaySettingsPanel();
    const settingsPanel = await this.settingsPanel();
    const signoutButton = await settingsPanel.signoutButton();
    await signoutButton.click();
  }

  async _isDisplayed(element) {
    try {
      return element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async waitForLoading() {
    await browser.waitUntil(
      async () => {
        const container = await $(cssPaths.euiContainer);
        return this._isDisplayed(container);
      },
      {
        timeoutMsg: 'Failed to load eui container',
      },
    );
    await browser.waitUntil(
      async () => {
        const container = await $(cssPaths.euiContainer);
        const appBar = await container.shadow$(cssPaths.euiAppBar);
        return this._isDisplayed(appBar);
      },
      {
        timeoutMsg: 'Failed to load eui app bar',
      },
    );
    await browser.waitUntil(
      async () => {
        const container = await $(cssPaths.euiContainer);
        const content = await container.shadow$(cssPaths.content);
        return this._isDisplayed(content);
      },
      {
        timeoutMsg: 'Failed to load app content',
      },
    );
  }
}

export default {
  SystemBar,
  SettingsPanel,
  MenuPanel,
  PageBase,
  SystemPanel,
};
