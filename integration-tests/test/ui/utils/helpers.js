const cssPaths = {
  dropdownItem: 'eui-menu-item',
};

export async function selectDropdownOption(dropdown, optionLabel) {
  await dropdown.click();
  await browser.pause(200); // wait for open options
  const dropdownitems = await dropdown.shadow$$(cssPaths.dropdownItem);
  const itemLabels = await dropdownitems.map((item) => item.getAttribute('label'));
  const itemIndex = itemLabels.findIndex((label) => label === optionLabel);
  await dropdownitems[itemIndex].click();
  await browser.pause(500);
}

export default {
  selectDropdownOption,
};
