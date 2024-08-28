import constants from '../../utils/constants.js';

import ChildAppRow from './ChildAppRow.js';

const cssPaths = {
  title: '.title',
  subtitle: '.description-short',
  description: '.description-long',
  favoriteIcon: '.favorite-icon',
  arrowIcon: '.accordion .icon',
  expandContainer: '.expandContainer',
  childApp: 'e-list-item',
  itemContainer: '.item-container',
  icon: '.icon',
};

class ListItem {
  constructor(root) {
    this.root = root;
  }

  async title() {
    const title = await this.root.shadow$(cssPaths.title);
    return title.getText();
  }

  async subtitle() {
    const subtitle = await this.root.shadow$(cssPaths.subtitle);
    return subtitle.getText();
  }

  async description() {
    const description = await this.root.shadow$(cssPaths.description);
    return description.getText();
  }

  async height() {
    const height = await this.root.getCSSProperty('height');
    return height.value;
  }

  async expandButton() {
    return this.root.shadow$(cssPaths.arrowIcon);
  }

  async favoriteIcon() {
    const favoriteIcon = await this.root.shadow$(cssPaths.favoriteIcon);
    return favoriteIcon.$(cssPaths.icon);
  }

  async childApps() {
    const itemContainer = await this.root.shadow$(cssPaths.itemContainer);
    const expandContainer = await itemContainer.$(cssPaths.expandContainer);
    const childApps = await expandContainer.$$(cssPaths.childApp);
    return childApps.map((childApp) => new ChildAppRow(childApp));
  }

  async click() {
    await this.root.click();
  }

  async isExpandable() {
    const expandButton = await this.expandButton();
    return expandButton.isExisting();
  }

  async isExpanded() {
    const expandButton = await this.expandButton();
    return (
      (await this.isExpandable()) && (await expandButton.getAttribute('name')) !== 'chevron-down'
    );
  }

  async expand() {
    const expandButton = await this.expandButton();
    if ((await this.isExpandable()) && !(await this.isExpanded())) {
      await expandButton.click();
    }
  }

  async unExpand() {
    const expandButton = await this.expandButton();
    if ((await this.isExpandable()) && (await this.isExpanded())) {
      await expandButton.click();
    }
  }

  async setFavorite() {
    const favoriteIcon = await this.favoriteIcon();
    if (!(await this.isFavorite())) {
      await favoriteIcon.click();
    }
    return this;
  }

  async unsetFavorite() {
    const favoriteIcon = await this.favoriteIcon();
    if (await this.isFavorite()) {
      await favoriteIcon.click();
    } else if (await this.isPartialFavorite()) {
      await favoriteIcon.click();
      await favoriteIcon.click();
    }
    return this;
  }

  async isFavorite() {
    const favoriteIcon = await this.favoriteIcon();
    return (
      (await favoriteIcon.getAttribute('name')) === 'favorite-solid' &&
      (await favoriteIcon.getAttribute('color')) === constants.FAVORITE_COLOR
    );
  }

  async isNotFavorite() {
    const favoriteIcon = await this.favoriteIcon();
    return (
      (await favoriteIcon.getAttribute('name')) === 'favorite' &&
      (await favoriteIcon.getAttribute('color')) !== constants.FAVORITE_COLOR
    );
  }

  async isPartialFavorite() {
    const favoriteIcon = await this.favoriteIcon();
    return (
      (await favoriteIcon.getAttribute('name')) === 'favorite' &&
      (await favoriteIcon.getAttribute('color')) === constants.FAVORITE_COLOR
    );
  }
}

export default ListItem;
