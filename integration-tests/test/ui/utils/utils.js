import LauncherPage from '../page-objects/launcher/Launcher.page.js';

export async function getProductIndex(productName) {
  const productView = await LauncherPage.productView();
  const productCardContainer = await productView.productCardContainer();
  const productCards = await productCardContainer.productCards();
  const productTitles = await Promise.all(productCards.map((card) => card.title()));
  return productTitles.findIndex((title) => title === productName);
}

export async function openProduct(productName) {
  await LauncherPage.open();
  await LauncherPage.waitForLoading();

  const productView = await LauncherPage.productView();
  const productCardContainer = await productView.productCardContainer();
  const productCards = await productCardContainer.productCards();
  const index = await getProductIndex(productName);

  await productCards[index].click();
  await LauncherPage.waitForAppViewLoading();
}
