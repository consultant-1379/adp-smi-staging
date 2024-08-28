export default (attribute) => (app1, app2) => {
  if (app1[attribute] < app2[attribute]) {
    return -1;
  }
  if (app1[attribute] === app2[attribute]) {
    return 0;
  }
  return 1;
};
