/* eslint-disable no-param-reassign */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, Divider, MenuList, MenuItem, Popover } from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

const styles = {};

class ContextMenuBase extends Component {
  static propTypes = {
    menu: PropTypes.shape(),
  };

  state = {
    open: false,
    menu: [],
    position: { x: 0, y: 0 },
  };

  componentWillReceiveProps(nextProps) {
    const nextState = {};
    const { list, visible, position } = nextProps.menu;
    if (list) {
      nextState.menu = list;
    }
    if (visible) {
      nextState.open = visible;
    }
    if (position) {
      nextState.position = position;
    }
    this.setState(nextState);
  }

  closePopover = () => {
    this.setState({ open: false });
  };

  renderMenu = (children = {}, props = {}) => {
    const el = document.getElementById('context-menu');

    const getSubMenuPosition = e => {
      const rectTarget = e.currentTarget.getBoundingClientRect();
      return {
        style: {
          backgroundColor: 'white',
          position: 'fixed',
          left: `${rectTarget.right}px`,
          top: `${rectTarget.top}px`,
        },
      };
    };

    return (
      <MenuList {...props} onClick={() => this.closePopover()}>
        {children.map((menuItem, i) => {
          switch (menuItem.type) {
            case 'divider':
              return <Divider key={i} />;
            case 'item':
              return (
                <MenuItem
                  key={i}
                  index={i}
                  {...menuItem}
                  onClick={() => {
                    if (menuItem.onClick) {
                      menuItem.onClick();
                    }
                    this.closePopover();
                  }}
                >
                  {menuItem.name}
                </MenuItem>
              );
            case 'subMenu': {
              return (
                <div key={i}>
                  <MenuItem
                    key={i}
                    index={i}
                    onClick={e => {
                      menuItem.props = getSubMenuPosition(e);
                      menuItem.isShowChildren = !menuItem.isShowChildren;
                      e.stopPropagation();
                      this.forceUpdate();
                    }}
                  >
                    {menuItem.name}
                    <ArrowRightIcon />
                  </MenuItem>
                  {menuItem.isShowChildren
                    ? ReactDOM.createPortal(this.renderMenu(menuItem.children, menuItem.props), el)
                    : null}
                </div>
              );
            }
            default:
              return null;
          }
        })}
      </MenuList>
    );
  };

  render() {
    return (
      <Popover
        style={{
          left: this.state.position.x,
          top: this.state.position.y,
        }}
        open={this.state.open}
        onClick={() => this.closePopover()}
        onContextMenu={e => {
          this.closePopover();
          e.preventDefault();
        }}
      >
        {this.renderMenu(this.state.menu)}
      </Popover>
    );
  }
}

const mapStateToProps = state => {
  return {
    menu: state.contextMenu,
  };
};

const ContextMenu = connect(mapStateToProps)(withStyles(styles)(ContextMenuBase));

export default ContextMenu;
