const cssPaths = {
  link: 'app-main-logo a',
};

class IFrame {
  constructor(root) {
    this.root = root;
  }

  async switchToFrame() {
    await browser.switchToFrame(this.root);
  }

  async linkText() {
    const link = await browser.$(cssPaths.link);
    return link.getText();
  }
}

export default IFrame;
