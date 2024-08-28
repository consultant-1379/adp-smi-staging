import constants from '../../utils/constants.js';

import CustomCard from './CustomCard.js';
import ChildAppRow from './ChildAppRow.js';
import CardMenu from './CardMenu.js';

const cssPaths = {
  euiCard: 'e-custom-layout-card',
  cardMenu: 'e-card-menu',
  favoriteIcon: '.favorite-icon',
  accordion: 'div[slot="accordion"]',
  expandButton: '.pointer',
  expandContainer: '.expandContainer',
  childApp: 'e-list-item',
  itemContainer: '.item-container',
};

class AppCard extends CustomCard {
  constructor(root) {
    super();
    this.root = root;
  }

  async euiCard() {
    return this.root.shadow$(cssPaths.euiCard);
  }

  async expandButton() {
    const euiCard = await this.euiCard();
    const accordion = await euiCard.$(cssPaths.accordion);
    return accordion.$(cssPaths.expandButton);
  }

  async cardMenu() {
    const euiCard = await this.euiCard();
    const cardMenu = await euiCard.$(cssPaths.cardMenu);
    return new CardMenu(cardMenu);
  }

  async favoriteIcon() {
    const euiCard = await this.euiCard();
    const favoriteIcon = await euiCard.$(cssPaths.favoriteIcon);
    return favoriteIcon.$('.icon');
  }

  async childApps() {
    const euiCard = await this.euiCard();
    const expandContainer = await euiCard.$(cssPaths.expandContainer);
    const childApps = await expandContainer.$$(cssPaths.childApp);
    return childApps.map((childApp) => new ChildAppRow(childApp));
  }

  async childNames() {
    const euiCard = await this.euiCard();
    const expandContainer = await euiCard.$(cssPaths.expandContainer);
    const childApps = await expandContainer.$$(cssPaths.childApp);
    return childApps.map((childApp) => childApp.getAttribute('display-name'));
  }

  async setFavorite() {
    if (!(await this.isFavorite())) {
      const favoriteIcon = await this.favoriteIcon();
      await favoriteIcon.click();
    }
    return this;
  }

  async unsetFavorite() {
    const favoriteIcon = await this.favoriteIcon();
    if (await this.isFavorite()) {
      await favoriteIcon.click();
    } else if (await this.isPartialFavorite()) {
      const childApps = await this.childApps();
      childApps?.forEach((childApp) => {
        childApp.unsetFavorite();
      });
    }
    return this;
  }

  async isExpandable() {
    const expandButton = await this.expandButton();
    return expandButton.isExisting();
  }

  async isExpanded() {
    const expandButton = await this.expandButton();
    const expandButtonName = await expandButton.getAttribute('name');
    return (await this.isExpandable()) && expandButtonName !== 'chevron-down';
  }

  async expand() {
    if ((await this.isExpandable()) && !(await this.isExpanded())) {
      const expandButton = await this.expandButton();
      await expandButton.click();
    }
  }

  async unExpand() {
    if ((await this.isExpandable()) && (await this.isExpanded())) {
      const expandButton = await this.expandButton();
      await expandButton.click();
    }
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

export default AppCard;
