import Utils from '../../shared/utils';

const show = () => {
  const action = {
    type: 'CONTEXTMENU_SHOW',
    payload: {
      visible: true,
    },
  };
  Utils.getStore().dispatch(action);
};

const hide = () => {
  const action = {
    type: 'CONTEXTMENU_HIDE',
    payload: {
      visible: false,
    },
  };
  Utils.getStore().dispatch(action);
};

const create = list => {
  const action = {
    type: 'CONTEXTMENU_CREATE',
    payload: {
      list,
    },
  };
  Utils.getStore().dispatch(action);
};

const position = (x, y) => {
  const action = {
    type: 'CONTEXTMENU_POSITION',
    payload: {
      position: { x, y },
    },
  };
  Utils.getStore().dispatch(action);
};

export { create, position, show, hide };
