const cssPaths = {
  eDsgContentsMenu: 'e-dsg-contents-menu',
  highlight: '.highlight',
};

class TableOfContent {
  constructor(root) {
    this.root = root;
  }

  async contentsMenu() {
    return this.root.shadow$(cssPaths.eDsgContentsMenu);
  }

  async listItem(chapter) {
    const contentsMenu = await this.contentsMenu();
    return contentsMenu.shadow$(`#${chapter}`);
  }

  async getHighlightedId() {
    const contentsMenu = await this.contentsMenu();
    const highlight = await contentsMenu.shadow$(cssPaths.highlight);
    return highlight.getAttribute('id');
  }
}

export default TableOfContent;
