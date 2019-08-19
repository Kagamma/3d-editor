import { SideMenuItem } from './index';

let isBatching = false;

// Find a menu item based on its id
const findMenuItem = (menu, id) => {
  let result = null;
  for (let i = 0; i < menu.length; i += 1) {
    if (menu[i].id === id) {
      result = menu[i];
      break;
    }
    for (let j = 0; j < menu[i].children.length; j += 1) {
      if (menu[i].children[j].id === id) {
        result = menu[i].children[j];
        break;
      }

      if (menu[i].children[j].type === 'accordion' || menu[i].children[j].type === 'anchor') {
        result = findMenuItem(menu[i].children[j].children, id);
        if (result !== null) {
          break;
        }
      }
    }
  }
  return result;
};

const addMenuItem = (menu, { parentId, props }) => {
  if (!parentId) {
    menu.push(new SideMenuItem(props));
  } else {
    const parentItem = findMenuItem(menu, parentId);
    if (parentItem && (parentItem.type === 'accordion' || parentItem.type === 'tab' || parentItem.type === 'anchor')) {
      const newMenuItem = new SideMenuItem(props);
      parentItem.children.push(newMenuItem);
      if (props.children && props.type !== 'accordion') {
        props.children.forEach(p => {
          newMenuItem.children.push(new SideMenuItem(p));
        });
      }
    }
  }
};

const removeMenuChilds = (menu, { parentId }) => {
  if (parentId) {
    const menuItem = findMenuItem(menu, parentId);
    if (
      (menuItem && menuItem.type === 'accordion') ||
      (menuItem && menuItem.type === 'anchor') ||
      (menuItem && menuItem.type === 'tab')
    ) {
      menuItem.children = [];
    }
  } else {
    menu.splice(0, menu.length);
  }
};

// Menu reducer goes here
const menuReducer = (state = { children: [] }, { type, payload }) => {
  switch (type) {
    case 'MENU_STARTBATCH':
      isBatching = true;
      return state;
    case 'MENU_ENDBATCH':
      isBatching = false;
      return Object.assign({}, state);
    case 'MENU_REFRESH':
      return Object.assign({}, state);
    case 'MENU_ADD_TAB':
      if (isBatching) {
        return Object.assign(state, { children: [...state.children, payload] });
      }
      return Object.assign({}, state, { children: [...state.children, payload] });
    case 'MENU_ADD':
      addMenuItem(state.children, payload);
      if (isBatching) {
        return state;
      }
      return Object.assign({}, state);
    case 'MENU_REMOVE_CHILDS':
      removeMenuChilds(state.children, payload);
      if (isBatching) {
        return state;
      }
      return Object.assign({}, state);
    default:
      return state;
  }
};
//

const reducers = {
  menu: menuReducer,
};

export default reducers;
