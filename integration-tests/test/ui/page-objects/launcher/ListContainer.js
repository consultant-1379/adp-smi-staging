import ListItem from './ListItem.js';

const cssPaths = {
  listItem: 'e-list-item',
  groupName: '.group-name',
};

class ListContainer {
  constructor(root) {
    this.root = root;
  }

  async groupName() {
    const groupName = await this.root.shadow$(cssPaths.groupName);
    return groupName.getText();
  }

  async listItems() {
    const listItems = await this.root.shadow$$(cssPaths.listItem);
    return listItems.map((item) => new ListItem(item));
  }
}

export default ListContainer;
