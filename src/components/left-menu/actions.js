import Utils from '../../shared/utils';

const startBatch = () => {
  const action = {
    type: 'MENU_STARTBATCH',
    payload: {},
  };
  Utils.getStore().dispatch(action);
};

const endBatch = () => {
  const action = {
    type: 'MENU_ENDBATCH',
    payload: {},
  };
  Utils.getStore().dispatch(action);
};

const refresh = () => {
  const action = {
    type: 'MENU_REFRESH',
    payload: {},
  };
  Utils.getStore().dispatch(action);
};

const addTab = props => {
  const action = {
    type: 'MENU_ADD_TAB',
    payload: {
      ...props,
    },
  };
  Utils.getStore().dispatch(action);
};

const addMenuItem = (parentId, props) => {
  const action = {
    type: 'MENU_ADD',
    payload: {
      parentId,
      props,
    },
  };
  Utils.getStore().dispatch(action);
};

const removeMenuChilds = parentId => {
  const action = {
    type: 'MENU_REMOVE_CHILDS',
    payload: {
      parentId,
    },
  };
  Utils.getStore().dispatch(action);
};

export { addTab, addMenuItem, removeMenuChilds, refresh, startBatch, endBatch };
