import CardsArea from './CardsArea.js';

class ContentArea extends CardsArea {
  constructor(root) {
    super(root);
    this.extendCssPath({
      viewAllLink: '#view-all-link eui-link',
    });
  }

  async viewTypeAttribute() {
    return this.root.getAttribute('view-type');
  }

  async groupingTypeAttribute() {
    return this.root.getAttribute('grouping-type');
  }

  async viewAllLink() {
    return this.root.shadow$(this.cssPaths.viewAllLink);
  }
}

export default ContentArea;
