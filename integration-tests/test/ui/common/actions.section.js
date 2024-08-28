const cssPaths = {
  euiAppBarMenuToggle: '#AppBar-menu-toggle',

  title: '.title',
  actionBar: 'e-action-bar',
};

class ActionsSection {
  constructor(root) {
    this.root = root;
  }

  async appTitle() {
    const title = await this.root.$(cssPaths.title);
    return title.getText();
  }

  async actionBar() {
    return this.root.$(cssPaths.actionBar);
  }

  async menuToggle() {
    return this.root.$(cssPaths.euiAppBarMenuToggle);
  }
}

export default ActionsSection;
