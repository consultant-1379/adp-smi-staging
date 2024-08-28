const cssPaths = {
  markdownRenderer: 'e-dsg-markdown-renderer',
  htmlRenderer: 'e-dsg-html-renderer',
  holder: '#holder',
  dsgHeader: 'e-dsg-heading',
  euiIcon: 'eui-icon',
  i: 'i',
};

class MarkdownWrapper {
  constructor(root) {
    this.root = root;
  }

  async markdownRenderer() {
    return this.root.shadow$(cssPaths.markdownRenderer);
  }

  async htmlRenderer() {
    return this.root.shadow$(cssPaths.htmlRenderer);
  }

  async holder(renderer) {
    return renderer.shadow$(cssPaths.holder);
  }

  async getMDText() {
    const markdownRenderer = await this.markdownRenderer();
    const holder = await this.holder(markdownRenderer);
    return holder.getHTML(false);
  }

  async getHTMLText() {
    const htmlRenderer = await this.htmlRenderer();
    const holder = await this.holder(htmlRenderer);
    return holder.getHTML(false);
  }

  async headings() {
    const markdownRenderer = await this.markdownRenderer();
    return markdownRenderer.shadow$$(cssPaths.dsgHeader);
  }

  async heading(chapter) {
    const headings = await this.headings();
    const chapters = await headings.map((h) => h.getAttribute('chapter'));
    const index = chapters.findIndex((c) => c === chapter);
    return headings[index];
  }

  async headingIcon(chapter) {
    const heading = await this.heading(chapter);
    const IS_IN_VIEWPORT = await heading.isDisplayedInViewport();
    if (!IS_IN_VIEWPORT) {
      await heading.scrollIntoView();
    }
    await heading.moveTo();
    const euiIcon = await heading.shadow$(cssPaths.euiIcon);
    await euiIcon.waitForDisplayed();
    const icon = await euiIcon.shadow$(cssPaths.i);
    await icon.waitForDisplayed();
    return icon;
  }
}

export default MarkdownWrapper;
