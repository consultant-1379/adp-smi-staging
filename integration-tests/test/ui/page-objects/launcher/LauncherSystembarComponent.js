import ProductView from './ProductView.js';
import AppView from './AppView.js';

const cssPaths = {
  icon: 'eui-icon',
  flyoutPanel: 'eui-flyout-panel',
  navigationSystembarComponent: 'e-navigation-systembar-component',
  launcherComponent: 'e-launcher-component',
  productView: 'e-product-view',
  appView: 'e-app-view',
  backButton: '#back-button',
  closePanel: '.close-panel',
  euiLink: 'eui-link',
};

class SystembarLauncherComponent {
  constructor(root) {
    this.root = root;
  }

  async launcherIcon() {
    return this.root.shadow$(cssPaths.icon);
  }

  async flyoutPanel() {
    return this.root.shadow$(cssPaths.flyoutPanel);
  }

  async launcherComponent() {
    const flyoutPanel = await this.flyoutPanel();
    const navigationSystembar = await flyoutPanel.$(cssPaths.navigationSystembarComponent);
    return navigationSystembar.shadow$(cssPaths.launcherComponent);
  }

  async productView() {
    const launcherComponent = await this.launcherComponent();
    const productView = await launcherComponent.shadow$(cssPaths.productView);
    return new ProductView(productView);
  }

  async appView() {
    const launcherComponent = await this.launcherComponent();
    const appView = await launcherComponent.shadow$(cssPaths.appView);
    return new AppView(appView);
  }

  async waitForLoading() {
    const flyoutPanel = await this.flyoutPanel();
    await flyoutPanel.waitForDisplayed();
    const launcherComponent = await this.launcherComponent();
    await launcherComponent.waitForDisplayed();
    const productView = await launcherComponent.shadow$(cssPaths.productView);
    await productView.waitForDisplayed();
  }

  async waitForAppView() {
    const launcherComponent = await this.launcherComponent();
    const appView = await launcherComponent.shadow$(cssPaths.appView);
    await appView.waitForDisplayed();
  }

  async waitForProductView() {
    const launcherComponent = await this.launcherComponent();
    const productView = await launcherComponent.shadow$(cssPaths.productView);
    await productView.waitForDisplayed();
  }

  async backButton() {
    const flyoutPanel = await this.flyoutPanel();
    const navigationSystembar = await flyoutPanel.$(cssPaths.navigationSystembarComponent);
    return navigationSystembar.shadow$(cssPaths.backButton);
  }

  async closePanel() {
    const flyoutPanel = await this.flyoutPanel();
    return flyoutPanel.shadow$(cssPaths.closePanel);
  }

  async portalLink() {
    const flyoutPanel = await this.flyoutPanel();
    return flyoutPanel.$(cssPaths.euiLink);
  }
}

export default SystembarLauncherComponent;
