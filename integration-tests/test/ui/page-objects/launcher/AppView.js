import CardsArea from './CardsArea.js';

const cssPaths = {
  cardContainer: 'e-card-container',
  listContainer: 'e-list-container',
  groupingTypeDropdown: '.groupingType-dropdown eui-dropdown',
  viewTypeDropdown: '.viewType-dropdown',
  dropdownItem: 'eui-menu-item',
  favoritePill: '.favorite-pill',
  emptyState: '.empty-state',
};

class AppView extends CardsArea {
  constructor(root) {
    super(root);
    this.extendCssPath(cssPaths);
  }
}

export default AppView;
