// Explicit store the dispatch()
// TODO: Need to find a way to access store in helper functions
const store = {};

const setStore = value => {
  store.dispatch = value;
};

const getStore = () => {
  return store;
};

const utils = {
  setStore,
  getStore,
};

export default utils;
