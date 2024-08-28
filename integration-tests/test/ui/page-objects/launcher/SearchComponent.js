const cssPaths = {
  groupableComboBox: 'e-groupable-combo-box',
  textField: 'eui-text-field',
  menu: 'eui-menu',
  menuItem: 'eui-menu-item',
  icon: 'eui-icon',
  input: 'input',
};

class SearchComponent {
  constructor(root) {
    this.root = root;
  }

  async groupableComboBox() {
    return this.root.shadow$(cssPaths.groupableComboBox);
  }

  async textField() {
    const groupableComboBox = await this.groupableComboBox();
    const textField = await groupableComboBox.shadow$(cssPaths.textField);
    return textField.shadow$(cssPaths.input);
  }

  async menu() {
    const groupableComboBox = await this.groupableComboBox();
    return groupableComboBox.shadow$(cssPaths.menu);
  }

  async menuItems() {
    const menu = await this.menu();
    return menu.$$(cssPaths.menuItem);
  }

  async icon() {
    const groupableComboBox = await this.groupableComboBox();
    const textField = await groupableComboBox.shadow$(cssPaths.textField);
    return textField.$(cssPaths.icon);
  }

  async menuItemLabels() {
    const menuItems = await this.menuItems();
    const menuItemClasses = await menuItems.map((menuItem) => menuItem.getAttribute('class'));
    return menuItems
      .filter((_menuItem, index) => !menuItemClasses[index].includes('hidden'))
      .map((menuItem) => menuItem.getAttribute('label'));
  }

  async waitForFiltered(expectedMenuItems = 2) {
    await browser.waitUntil(
      async () => (await this.menuItemLabels()).length === expectedMenuItems,
      {
        timeoutMsg: 'Failed to wait for menu items',
      },
    );
  }

  async _isDisplayed(element) {
    try {
      return element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async waitForGroupableComboBoxLoading() {
    await this._waitForLoading(cssPaths.groupableComboBox);
  }

  async _waitForLoading(viewCssPath) {
    await browser.waitUntil(
      async () => {
        const view = await this.root.shadow$(viewCssPath);
        return this._isDisplayed(view);
      },
      {
        timeoutMsg: `Failed to load ${viewCssPath}`,
      },
    );
  }
}

export default SearchComponent;
