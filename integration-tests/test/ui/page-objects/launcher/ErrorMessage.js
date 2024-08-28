const cssPaths = {
  errorMessage: 'e-error-message',
  div: 'div',
};

class ErrorMessage {
  constructor(root) {
    this.root = root;
  }

  async errorMessage() {
    return this.root.shadow$(cssPaths.errorMessage);
  }

  async div() {
    const errorMessage = await this.errorMessage();
    return errorMessage.shadow$(cssPaths.div);
  }

  async getText() {
    const div = await this.div();
    return div.getHTML(false);
  }
}

export default ErrorMessage;
