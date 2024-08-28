const FAVORITE_ICON_NAME = 'favorite-solid';
const FAVORITE_MENU_ITEM_INDEX = 1;
const TOOLTIP_MENU_ITEM_INDEX = 0;

const cssPaths = {
  menuIcon: '#menu-icon',
  euiMenu: 'eui-menu',
  euiMenuItem: 'eui-menu-item',
  euiIcon: 'eui-icon',
  euiTooltip: 'eui-tooltip',
  subtitle: '.subtitle',
  description: '.description',
};

class CardMenu {
  constructor(root) {
    this.root = root;
  }

  async menuIcon() {
    return this.root.shadow$(cssPaths.menuIcon);
  }

  async euiMenu() {
    return this.root.shadow$(cssPaths.euiMenu);
  }

  async menuItems() {
    const euiMenu = await this.euiMenu();
    return euiMenu.$$(cssPaths.euiMenuItem);
  }

  async isMenuDisplayed() {
    const euiMenu = await this.euiMenu();
    return euiMenu.isDisplayed();
  }

  async favoriteMenuItem() {
    const menuItems = await this.menuItems();
    return menuItems[FAVORITE_MENU_ITEM_INDEX];
  }

  async isFavorite() {
    const favoriteMenuItem = await this.favoriteMenuItem();
    const euiIcon = await favoriteMenuItem.$(cssPaths.euiIcon);
    return (await euiIcon.getAttribute('name')) === FAVORITE_ICON_NAME;
  }

  async tooltipMenuItem() {
    const menuItems = await this.menuItems();
    return menuItems[TOOLTIP_MENU_ITEM_INDEX];
  }

  async tooltip() {
    return this.root.shadow$(cssPaths.euiTooltip);
  }

  async isTooltipExisting() {
    const tooltip = await this.tooltip();
    return tooltip.isExisting();
  }

  async tooltipTitle() {
    const tooltip = await this.tooltip();
    const subtitle = await tooltip.$(cssPaths.subtitle);
    return subtitle.getText();
  }

  async tooltipDescription() {
    const tooltip = await this.tooltip();
    const description = await tooltip.$(cssPaths.description);
    return description.getText();
  }
}

export default CardMenu;
