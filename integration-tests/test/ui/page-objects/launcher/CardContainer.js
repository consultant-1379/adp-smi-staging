import ProductCard from './ProductCard.js';
import AppCard from './AppCard.js';

const cssPaths = {
  productCard: 'e-product-card',
  appCard: 'e-app-card',
  groupName: '.groupName',
  viewAll: '.viewAllLink',
};

class CardContainer {
  constructor(root) {
    this.root = root;
  }

  async productCards() {
    const productCards = await this.root.shadow$$(cssPaths.productCard);
    return productCards.map((card) => new ProductCard(card));
  }

  async appCards() {
    const appCards = await this.#getAppCardElements();
    return appCards.map((card) => new AppCard(card));
  }

  async groupName() {
    const groupName = await this.root.shadow$(cssPaths.groupName);
    return groupName.getText();
  }

  async #getAppCardElements() {
    return this.root.shadow$$(cssPaths.appCard);
  }

  async findAppCard(cardName) {
    const appCards = await this.#getAppCardElements();
    const foundApp = await appCards.find(async (appCardElement) => {
      const name = await new AppCard(appCardElement).title();
      return name === cardName;
    });
    if (foundApp) {
      return new AppCard(foundApp);
    }
    return null;
  }

  async viewAllLink() {
    return this.root.shadow$(cssPaths.viewAll);
  }
}

export default CardContainer;
