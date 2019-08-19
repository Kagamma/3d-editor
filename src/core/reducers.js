import leftMenuReducers from '../components/left-menu/reducers';
import contextMenuReducers from '../components/context-menu/reducers';

const reducers = {
  ...contextMenuReducers,
  ...leftMenuReducers,
};

export default reducers;
