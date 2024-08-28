import LauncherView from './LauncherView.js';
import CardContainer from './CardContainer.js';
import ListContainer from './ListContainer.js';
import { selectDropdownOption } from '../../utils/helpers.js';

const cssPaths = {
  cardContainer: 'e-card-container',
  listContainer: 'e-list-container',
  groupingTypeDropdown: '.groupingType-dropdown eui-dropdown',
  viewTypeDropdown: '.viewType-dropdown',
  dropdownItem: 'eui-menu-item',
  favoritePill: '.favorite-pill',
  emptyState: '.empty-state',
};

class CardsArea extends LauncherView {
  constructor(root) {
    super(root);
    this.extendCssPath(cssPaths);
  }

  async cardContainers() {
    const cardContainerElements = await this.#getContainerElements();
    return cardContainerElements.map((element) => new CardContainer(element));
  }

  async listContainers() {
    const listContainerElements = await this.root.shadow$$(this.cssPaths.listContainer);
    return listContainerElements.map((element) => new ListContainer(element));
  }

  async groupingTypeDropdown() {
    const actionBar = await this.actionBar();
    return actionBar.shadow$(this.cssPaths.groupingTypeDropdown);
  }

  async viewTypeDropdown() {
    const actionBar = await this.actionBar();
    return actionBar.shadow$(this.cssPaths.viewTypeDropdown);
  }

  async isEmptyStateVisible() {
    const emptyState = await this.root.shadow$(this.cssPaths.emptyState);
    return emptyState.isExisting();
  }

  async selectGroupingOption(option) {
    await selectDropdownOption(await this.groupingTypeDropdown(), option);
  }

  async selectViewOption(option) {
    await selectDropdownOption(await this.viewTypeDropdown(), option);
  }

  async favoritePill() {
    const actionBar = await this.actionBar();
    return actionBar.shadow$(this.cssPaths.favoritePill);
  }

  async findExpandableCards() {
    const results = [];
    const cardContainers = await this.cardContainers();
    await cardContainers.map(async (container) => {
      const appCards = await container.appCards();
      await appCards.map(async (appCard) => {
        if (await appCard.isExpandable()) {
          results.push(appCard);
        }
      });
    });
    return results;
  }

  async #getContainerElements() {
    return this.root.shadow$$(this.cssPaths.cardContainer);
  }

  async #findGroupCardContainer(groupName) {
    const cardContainers = await this.#getContainerElements();
    const foundContainer = await cardContainers.find(async (container) => {
      const name = await new CardContainer(container).groupName();
      return name === groupName;
    });
    if (foundContainer) {
      return new CardContainer(foundContainer);
    }
    return null;
  }

  async findSpecificCardForGroup(groupName, cardName) {
    const groupCardContainer = await this.#findGroupCardContainer(groupName);
    return groupCardContainer?.findAppCard(cardName);
  }
}

export default CardsArea;
