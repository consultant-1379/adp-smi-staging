import euiFrame from '../common/eui-frame.component.js.js';

const cssPaths = {
  charts: 'e-charts',
  chartTile: 'e-chart-tile',
  donutChart: 'e-donut-chart',
  euiLoader: 'eui-loader',
};

class ChartsPage extends euiFrame.PageBase {
  async root() {
    const content = await this.content();
    return content.$(cssPaths.charts);
  }

  async chartTitles() {
    const root = await this.root();
    const chartTiles = await root.shadow$$(cssPaths.chartTile);
    return Promise.all(chartTiles.map((tile) => tile.getAttribute('tile-title')));
  }

  async chartTile() {
    const root = await this.root();
    return root.shadow$(cssPaths.chartTile);
  }

  async donutChart() {
    const tile = await this.chartTile();
    return tile.$(cssPaths.donutChart);
  }

  async waitForLoading() {
    super.waitForLoading();
    await browser.waitUntil(
      async () => {
        const root = await this.root();
        const euiLoader = await root.shadow$(cssPaths.euiLoader);
        const isDisplayed = await this._isDisplayed(euiLoader);
        return !isDisplayed;
      },
      {
        timeoutMsg: 'Failed to wait for loader to disappear',
      },
    );
  }
}

export default new ChartsPage();
