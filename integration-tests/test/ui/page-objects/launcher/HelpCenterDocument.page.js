import PageBase from './Page.base.js';
import MarkdownWrapper from './MarkdownWrapper.js';
import ErrorMessage from './ErrorMessage.js';
import NativeRenderer from './NativeRenderer.js';
import SplitView from './SplitView.js';
import TableOfContent from './TableOfContent.js';
import OpenAPISpecsWrapper from './OpenAPISpecsWrapper.js';

const cssPaths = {
  euiContainer: 'eui-container',
  main: 'main',
  helpCenterDocumentPage: 'e-help-center-document-page',
  documentView: 'e-document-view',
  documentWrapper: 'e-document-wrapper',
  markdownWrapper: 'e-markdown-wrapper',
  nativeRenderer: 'e-native-renderer',
  errorMessage: 'e-error-message',
  openAPISpecsWrapper: 'e-open-api-specs-wrapper',
  splitView: 'e-dsg-split-view',
  tableOfContent: 'e-table-of-content',
};

class DocumentPage extends PageBase {
  async root() {
    const appContent = await this.content();
    const helpCenterDocumentPage = await appContent.$(cssPaths.helpCenterDocumentPage);
    return helpCenterDocumentPage.shadow$(cssPaths.documentView);
  }

  async open(documentName) {
    await browser.url(
      `${browser.options.baseUrl}/#help-center/document?documentName=${documentName}`,
    );
  }

  async getDocumentWrapper() {
    const root = await this.root();
    return root.shadow$(cssPaths.documentWrapper);
  }

  async markdownWrapper() {
    const documentWrapper = await this.getDocumentWrapper();
    const markdownWrapper = await documentWrapper.shadow$(cssPaths.markdownWrapper);
    return new MarkdownWrapper(markdownWrapper);
  }

  async nativeRenderer() {
    const documentWrapper = await this.getDocumentWrapper();
    return documentWrapper.shadow$(cssPaths.nativeRenderer);
  }

  async openAPISpecsWrapper() {
    const documentWrapper = await this.getDocumentWrapper();
    const openAPISpecsWrapper = await documentWrapper.shadow$(cssPaths.openAPISpecsWrapper);
    return new OpenAPISpecsWrapper(openAPISpecsWrapper);
  }

  async getMDText() {
    const markdownWrapper = await this.markdownWrapper();
    return markdownWrapper.getMDText();
  }

  async getHTMLText() {
    const markdownWrapper = await this.markdownWrapper();
    return markdownWrapper.getHTMLText();
  }

  async getErrorText() {
    const root = await this.root();
    const errorMessage = new ErrorMessage(root);
    return errorMessage.getText();
  }

  async getNativeRendererSrc() {
    const nativeRenderer = await this.nativeRenderer();
    const renderer = new NativeRenderer(nativeRenderer);
    return renderer.getSrc();
  }

  async getOpenAPIText() {
    const openAPISpecsWrapper = await this.openAPISpecsWrapper();
    return openAPISpecsWrapper.getText();
  }

  async getSplitView() {
    const root = await this.root();
    const splitView = root.shadow$(cssPaths.splitView);
    return new SplitView(splitView);
  }

  async tableOfContent() {
    const root = await this.root();
    const tableOfContent = await root.shadow$(cssPaths.tableOfContent);
    return new TableOfContent(tableOfContent);
  }
}

export default new DocumentPage();
