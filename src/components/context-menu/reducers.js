// Menu reducer goes here
const menuReducer = (state = { children: [] }, { type, payload }) => {
  switch (type) {
    case 'CONTEXTMENU_SHOW':
    case 'CONTEXTMENU_HIDE':
    case 'CONTEXTMENU_CREATE':
    case 'CONTEXTMENU_POSITION':
      return Object.assign({}, state, { ...payload });
    default:
      return state;
  }
};
//

const reducers = {
  contextMenu: menuReducer,
};

export default reducers;
