import constants from '../../utils/constants.js';

const cssPaths = {
  favoriteIcon: '.favorite-icon',
  itemContainer: '.item-container',
};

class ChildAppRow {
  constructor(root) {
    this.root = root;
  }

  async favoriteIcon() {
    const itemContainer = await this.root.shadow$(cssPaths.itemContainer);
    return itemContainer.$(cssPaths.favoriteIcon);
  }

  async setFavorite(index) {
    if (!(await this.isFavorite(index))) {
      const favoriteIcon = await this.favoriteIcon();
      await favoriteIcon.click();
    }
  }

  async unsetFavorite(index) {
    if (await this.isFavorite(index)) {
      const favoriteIcon = await this.favoriteIcon();
      await favoriteIcon.click();
    }
  }

  async isFavorite() {
    const favoriteIcon = await this.favoriteIcon();
    const icon = await favoriteIcon.$('.icon');
    return (await icon.getAttribute('color')) === constants.FAVORITE_COLOR;
  }
}

export default ChildAppRow;
