import React from 'react';
import { connect } from 'react-redux';
import { Sidebar, Layout } from 'react-admin';
import { withStyles, Toolbar, IconButton, AppBar } from '@material-ui/core';
import PropTypes from 'prop-types';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Utils from '../shared/utils';

const appBarStyles = {
  root: {
    background: 'white',
    color: '#2196f3',
    display: 'flex',
    flexFlow: 'row',
    height: '48px',
    justifyContent: 'space-between',
  },
  toolBar: {
    background: 'linear-gradient(to bottom, #2196f3, #16BFFC)',
    clipPath: 'polygon(0 0, 100% 0, calc(100% - 40px) 100%, 0 100%)',
    color: 'white',
    flex: 1,
    minHeight: 'unset',
  },
};

const CustomAppBar = props => {
  const { classes } = props;
  const auth = 'authorized';

  return (
    <AppBar className={classes.root}>
      <Toolbar className={classes.toolBar}>
        <IconButton color="inherit">
          <MenuIcon />
        </IconButton>
      </Toolbar>
      {auth && (
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
      )}
    </AppBar>
  );
};

CustomAppBar.propTypes = {
  classes: PropTypes.shape(),
};

const styles = {
  root: {
    minHeight: 'calc(100% - 60px)',
    zIndex: 'unset',
  },
};

class BlankMenu extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const { dispatch } = props;
    Utils.setStore(dispatch);
  }

  render() {
    return null;
  }
}

const BlankMenuHOC = connect(null)(BlankMenu);

const CustomLayout = ({ classes, ...props }) => (
  <Layout
    {...props}
    title="Superior Software"
    appBar={withStyles(appBarStyles)(CustomAppBar)}
    sidebar={Sidebar}
    menu={BlankMenuHOC}
    classes={{ root: classes.root }}
  />
);

CustomLayout.propTypes = {
  classes: PropTypes.shape(),
};

export default withStyles(styles)(CustomLayout);
