const cssPaths = {
  iframe: 'iframe',
};

class NativeRenderer {
  constructor(root) {
    this.root = root;
  }

  async nativeRenderer() {
    return this.root.shadow$(cssPaths.iframe);
  }

  async getSrc() {
    const nativeRenderer = await this.nativeRenderer();
    return nativeRenderer.getAttribute('src');
  }
}

export default NativeRenderer;
