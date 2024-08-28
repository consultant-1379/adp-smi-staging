const cssPaths = {
  customLayoutCard: 'e-custom-layout-card',
  content: 'div[slot="content"]',
  title: '.eui__card__title',
  description: '.description',
  subtitle: '.eui__card__subtitle',
  arrowIcon: '.accordion .icon',
};

class CustomCard {
  constructor(root) {
    this.root = root;
  }

  async card() {
    return this.root.shadow$(cssPaths.customLayoutCard);
  }

  async title() {
    const card = await this.card();
    const cardTitle = await card.shadow$(cssPaths.title);
    return cardTitle.getText();
  }

  async subtitle() {
    const card = await this.card();
    const subtitle = await card.shadow$(cssPaths.subtitle);
    return subtitle.getText();
  }

  async description() {
    const card = await this.card();
    const description = await card.$(cssPaths.description);
    return description.getText();
  }

  async content() {
    return this.root.shadow$$(cssPaths.content);
  }

  async height() {
    const card = await this.card();
    const height = await card.getCSSProperty('height');
    return height.value;
  }

  async scrollIntoViewIfNeeded() {
    const card = await this.card();
    const IS_IN_VIEWPORT = await card.isDisplayedInViewport();
    if (!IS_IN_VIEWPORT) {
      await card.scrollIntoView();
    }
  }

  async click() {
    const card = await this.card();
    await card.click();
  }

  async clickArrowIcon() {
    const card = await this.card();
    const arrowIcon = await card.$(cssPaths.arrowIcon);
    await arrowIcon.click();
    return this;
  }
}

export default CustomCard;
