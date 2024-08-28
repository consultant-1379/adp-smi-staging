const cssPaths = {
  apiRenderer: 'e-dsg-api-renderer',
  rapiDoc: 'rapi-doc',
  mainBody: '#the-main-body',
};

class OpenAPISpecsWrapper {
  constructor(root) {
    this.root = root;
  }

  async holder() {
    const apiRenderer = await this.root.shadow$(cssPaths.apiRenderer);
    const rapiDoc = await apiRenderer.shadow$(cssPaths.rapiDoc);
    return rapiDoc.shadow$(cssPaths.mainBody);
  }

  async getText() {
    const holder = await this.holder();
    return holder.getHTML(false);
  }
}

export default OpenAPISpecsWrapper;
