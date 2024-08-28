const cssPaths = {
  primary: '.doc-holder',
  secondary: '.doc-property-holder',
  markdownWrapper: 'e-markdown-wrapper',
  tableOfContent: 'e-table-of-content',
  flyoutPanel: 'eui-flyout-panel',
};

class SplitView {
  constructor(root) {
    this.root = root;
  }

  markdownWrapper() {
    const primary = this.root.$(cssPaths.primary);
    return primary.$(cssPaths.markdownWrapper);
  }

  tableOfContent() {
    const secondary = this.root.$(cssPaths.secondary);
    return secondary.$(cssPaths.tableOfContent);
  }

  flyoutContent() {
    const flyoutPanel = this.root.shadow$(cssPaths.flyoutPanel);
    return flyoutPanel.$(cssPaths.tableOfContent);
  }

  async isSecondaryPanelDisplayed() {
    const secondary = this.root.$(cssPaths.secondary);
    return secondary.isDisplayed();
  }

  async isFlyoutPanelOpened() {
    const flyoutPanel = this.root.shadow$(cssPaths.flyoutPanel);
    return flyoutPanel.isDisplayed();
  }

  async waitToDisplayFlyoutPanel() {
    const flyoutPanel = this.root.shadow$(cssPaths.flyoutPanel);
    return browser.waitUntil(async () => (await flyoutPanel.isDisplayed()) === true);
  }

  async waitToHideFlyoutPanel() {
    const flyoutPanel = this.root.shadow$(cssPaths.flyoutPanel);
    return browser.waitUntil(async () => (await flyoutPanel.isDisplayed()) === false);
  }
}

export default SplitView;
