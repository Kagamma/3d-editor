/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ColorPicker from 'material-ui-color-picker';
import {
  withStyles,
  Select,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Button,
  Checkbox,
  TextField,
  List,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';

const styles = {
  tabsScroller: {
    overflowX: 'auto',
  },
  itemContainer: {
    boxSizing: 'border-box',
    width: '100%',
    marginTop: '0',
    marginBottom: '8px',
    display: 'flex',
    padding: '0 10px 2px 10px',
  },
  itemLabel: {
    marginTop: '8px',
    fontSize: 'small',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    width: '40%',
  },
  itemControl: {
    width: 'calc(100% - 120px)',
    float: 'left',
  },
  itemControlFull: {
    width: '100%',
    float: 'left',
  },
  leafContainer: {
    display: 'flex',
    width: '100%',
  },
  leaf: {
    backgroundColor: '#ddf',
    flexGrow: 1,
    cursor: 'pointer',
  },
  leafSelected: {
    backgroundColor: '#ffa',
    flexGrow: 1,
    cursor: 'pointer',
  },
  expansionPanelSummary: {
    background: 'linear-gradient(to bottom, #2196f3, #16BFFC)',
    clipPath: 'polygon(0 0, 100% 0, calc(100% - 26px) 100%, 0 100%)',
    height: '26px',
    minHeight: 'unset !important',
  },
  expansionPanelSummaryExpanded: {
    margin: '0',
  },
  expansionPanelSummaryLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupLabel: {
    fontWeight: 'bold',
    marginTop: '10px',
  },
  itemPrefix: {
    width: '5%',
  },
  itemDetails: {
    fontSize: 'small',
    width: '60%',
  },
  itemDetailMulti: {
    fontSize: 'small',
    width: '60%',
  },
  itemDetailMultiChild: {
    marginLeft: '3px',
    width: 'calc(33% - 3px)',
  },
  textField: {
    fontSize: 'small',
    width: '60%',
  },
  itemSuffix: {
    fontSize: 'small',
    paddingLeft: '3%',
    width: '9%',
  },
  itemNote: {
    color: 'red',
    fontSize: 'small',
    paddingLeft: '40%',
    width: '60%',
  },
  colorField: {
    display: 'flex',
    width: '60%',
  },
  colorSample: {
    borderRadius: '2px 2px 18px 2px',
    margin: '2px 10px 2px 0',
    width: '40%',
  },
  materialSample: {
    minHeight: '48px',
  },
  materialSelection: {
    height: '100%',
    padding: '0 24px 0 0',
  },
  inputFile: {
    border: '2px solid #90caf9',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: 'medium',
    fontStyle: 'italic',
    margin: '0 0 8px',
    padding: '7px',
    wordBreak: 'break-word',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
};

const TabPanel = props => {
  const { children, selectedTab, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      style={{ display: selectedTab === index ? 'block' : 'none' }}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {children}
    </Typography>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  selectedTab: PropTypes.number.isRequired,
};

const a11yProps = index => ({
  id: `scrollable-auto-tab-${index}`,
  'aria-controls': `scrollable-auto-tabpanel-${index}`,
});

class SideMenuItem {
  constructor(payload) {
    // Add payload to menu item
    this.min = -99999;
    this.max = 99999;
    Object.keys(payload).forEach(key => {
      this[key] = payload[key];
    });
    this.children = [];
  }

  add(menuItem) {
    this.children.push(menuItem);
    this.parent = this.children;
    this.refresh();
  }

  remove() {
    const parentChildren = this.parent;
    for (let i = 0; i < parentChildren.length; i += 1) {
      if (parentChildren[i] === this) {
        parentChildren.splice(i, 1);
        break;
      }
    }
    this.refresh();
  }

  findRecursive(children, id) {
    let result = null;
    for (let i = 0; i < children.length; i += 1) {
      if (children[i].id === id) {
        result = children[i];
        break;
      }
      if (children[i].type === 'accordion') {
        result = this.findRecursive(children[i].children, id);
        if (result !== null) {
          break;
        }
      }
    }
    return result;
  }

  find(id) {
    return this.findRecursive(this, id);
  }
}

class LeftMenuBase extends React.Component {
  static propTypes = {
    classes: PropTypes.shape(),
    menu: PropTypes.shape(),
  };

  state = {
    selectedTab: 0,
  };

  openedAccordionId = '';

  renderAccordion = item => {
    const { classes, menu } = this.props;
    const disableAccordions = children => {
      children.forEach(child => {
        if (child.type === 'accordion') {
          child.value = false;
        } else if (child.children && child.children.length > 0) {
          disableAccordions(child.children);
        }
      });
    };
    if (this.openedAccordionId === item.id) {
      item.value = true;
    }
    return (
      <ExpansionPanel
        key={item.id}
        classes={{
          expanded: classes.expansionPanelSummaryExpanded,
        }}
        defaultExpanded={item.value}
        expanded={item.value}
        onClick={() => {
          const oldValue = item.value;
          disableAccordions(menu.children);
          item.value = !oldValue;
          if (item.value) {
            this.openedAccordionId = item.id;
          }
          if (item.onClick) {
            item.onClick(item);
          }
          this.forceUpdate();
        }}
      >
        <ExpansionPanelSummary
          classes={{
            root: classes.expansionPanelSummary,
            expanded: classes.expansionPanelSummaryExpanded,
          }}
        >
          <Typography classes={{ root: classes.expansionPanelSummaryLabel }}>{item.label}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ width: '100%', padding: '0' }}>
          <List style={{ width: '100%' }}>{item.children && item.value ? this.renderMenu(item.children) : null}</List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  renderAnchor = item => {
    return (
      <React.Fragment key={item.id}>
        <List style={{ width: '100%' }}>{item.children ? this.renderMenu(item.children) : null}</List>
      </React.Fragment>
    );
  };

  renderButton = item => {
    const { classes } = this.props;
    return (
      <Button
        key={item.id}
        classes={{ root: classes.itemDetails }}
        variant="contained"
        color={item.color || 'secondary'}
        onClick={() => {
          if (item.onClick) {
            item.onClick(item);
          }
          this.forceUpdate();
        }}
      >
        {item.name}
      </Button>
    );
  };

  renderDropdown = item => {
    const { classes } = this.props;
    return (
      <Select
        key={item.id}
        className={classes.itemDetails}
        value={item.object[item.property]}
        onChange={event => {
          item.object[item.property] = event.target.value;
          if (item.onChange) {
            item.onChange(item, event.target.value);
          }
          this.forceUpdate();
        }}
      >
        {item.selectValues.map((it, index) => (
          <MenuItem value={it} key={index}>
            {it}
          </MenuItem>
        ))}
      </Select>
    );
  };

  renderCheckbox = item => {
    return (
      <Checkbox
        key={item.id}
        style={{ height: '36px' }}
        checked={item.object[item.property]}
        color={item.color}
        onChange={(event, checked) => {
          item.object[item.property] = checked;
          if (item.onChange) {
            item.onChange(item, checked);
          }
          this.forceUpdate();
        }}
      />
    );
  };

  renderColorPicker = item => {
    return (
      <ColorPicker
        key={item.id}
        defaultValue={item.object[item.property] || '#FFFFFF'}
        onChange={color => {
          item.object[item.property] = color;
          if (item.onChange) {
            item.onChange(item, color);
          }
          this.forceUpdate();
        }}
      />
    );
  };

  renderScene = item => {
    const { classes } = this.props;
    const depth = [];
    depth.push(true);
    const renderRecursive = (children, leafDepth, isIncreaseDepth) => {
      if (isIncreaseDepth) {
        leafDepth.push(true);
      }
      const renderDOM = (
        <React.Fragment>
          {children.map(entity =>
            entity.entityType ? (
              <React.Fragment key={entity.uuid}>
                <div className={classes.leafContainer}>
                  <div
                    className={entity.isSelected ? classes.leafSelected : classes.leaf}
                    style={{
                      paddingLeft: `${leafDepth.length * 16}px`,
                    }}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick(item, entity);
                      }
                      this.forceUpdate();
                    }}
                    onDoubleClick={() => {
                      if (item.onDoubleClick) {
                        item.onDoubleClick(item, entity);
                      }
                    }}
                    onContextMenu={e => {
                      if (item.onContextMenu) {
                        item.onContextMenu(item, entity, e);
                      }
                      e.preventDefault();
                    }}
                    role="presentation"
                  >
                    <Typography>{`> ${entity.name}`}</Typography>
                  </div>
                </div>
                {entity.entityType === 'Group' ? renderRecursive(entity.children, depth, true) : null}
              </React.Fragment>
            ) : null
          )}
        </React.Fragment>
      );
      leafDepth.pop();
      return renderDOM;
    };
    return <React.Fragment>{renderRecursive(item.object[item.property], depth)}</React.Fragment>;
  };

  renderInput = item => {
    const { classes } = this.props;
    return (
      <TextField
        key={item.id}
        classes={{ root: classes.itemDetails }}
        value={item.object[item.property] || 0}
        type={item.inputType}
        inputProps={{ className: classes.textField, min: item.min, max: item.max, step: item.step }}
        onChange={event => {
          let v = event.target.value;
          if (v) {
            if (item.inputType === 'number') {
              v = parseFloat(parseFloat(v).toFixed(2));
            }
            if (item.isRounded) {
              v = Math.round(v);
            }
            item.object[item.property] = v;
            if (item.onChange) {
              item.onChange(item, v);
            }
            this.forceUpdate();
          }
        }}
      />
    );
  };

  renderMultiInput = itemParent => {
    const { classes } = this.props;
    return (
      <div className={classes.itemDetailMulti}>
        {itemParent.children.map(item => (
          <TextField
            key={item.id}
            classes={{ root: classes.itemDetailMultiChild }}
            value={item.object[item.property] || 0}
            type={item.inputType}
            inputProps={{ className: classes.textField, min: item.min, max: item.max, step: item.step }}
            onChange={event => {
              let v = event.target.value;
              if (v) {
                if (item.inputType === 'number') {
                  v = parseFloat(parseFloat(v).toFixed(2));
                }
                if (item.isRounded) {
                  v = Math.round(v);
                }
                item.object[item.property] = v;
                if (item.onChange) {
                  item.onChange(item, v);
                }
                this.forceUpdate();
              }
            }}
          />
        ))}
      </div>
    );
  };

  renderMaterialPicker = item => {
    const { classes } = this.props;

    const selectValues = { keys: [] }; // require.context('../../../public/images/materials/', false, /.*\.jpg$/);

    return (
      <React.Fragment key={item.id}>
        <Select
          className={classes.colorField}
          classes={{ root: classes.materialSample, select: classes.materialSelection }}
          value={item.object[item.property]}
          renderValue={value => (
            <div
              style={{
                backgroundImage: `url(images/materials${value})`,
                backgroundSize: 'auto 100%',
                borderRadius: '0 0 18px 0',
                height: '100%',
              }}
            />
          )}
          onChange={event => {
            item.object[item.property] = event.target.value;
            if (item.onChange) {
              item.onChange(item, event.target.value);
            }
            this.forceUpdate();
          }}
        >
          {selectValues.keys().map((it, index) => (
            <MenuItem
              key={index}
              value={it.slice(1)}
              style={{
                backgroundImage: `url(images/materials${it.slice(1)})`,
                backgroundSize: 'auto 100%',
              }}
            />
          ))}
        </Select>
      </React.Fragment>
    );
  };

  renderImportField = item => {
    const { classes } = this.props;

    return (
      <div className={classes.itemDetails}>
        <input
          accept="*/*"
          id="raised-button-file"
          type="file"
          onChange={({ target: { files } }) => {
            document.getElementById('file-name').innerText = files.length > 0 ? files[0].name : 'Choose file';
          }}
          style={{ display: 'none' }}
        />
        <div
          id="file-name"
          className={classes.inputFile}
          onClick={() => {
            document.getElementById('raised-button-file').click();
          }}
          role="button"
          tabIndex="-1"
        >
          Choose file
        </div>
        <Button
          variant="contained"
          color={item.color || 'secondary'}
          style={{ width: '100%' }}
          onClick={() => {
            const { files } = document.getElementById('raised-button-file');
            if (files.length > 0) {
              item.onClick(files[0]);
            }
          }}
        >
          Upload
        </Button>
      </div>
    );
  };

  renderMenuItemDetails = item => {
    switch (item.type) {
      case 'button':
        return this.renderButton(item);
      case 'dropdown':
        return this.renderDropdown(item);
      case 'checkbox':
        return this.renderCheckbox(item);
      case 'input':
        return this.renderInput(item);
      case 'multiInput':
        return this.renderMultiInput(item);
      case 'colorpicker':
        return this.renderColorPicker(item);
      case 'scene':
        return this.renderScene(item);
      case 'materialPicker':
        return this.renderMaterialPicker(item);
      case 'import':
        return this.renderImportField(item);
      default:
        break;
    }
    return null;
  };

  renderMenuItem = item => {
    const { classes } = this.props;
    return (
      <div className={classes.itemContainer} key={item.id}>
        {item.label && item.label !== '' ? (
          <React.Fragment>
            <div className={classes.itemLabel}>{item.label}</div>
            {this.renderMenuItemDetails(item)}
          </React.Fragment>
        ) : (
          <div className={classes.itemControlFull}>{this.renderMenuItemDetails(item)}</div>
        )}
      </div>
    );
  };

  renderMenu = children => {
    const renderArray = [];
    for (let i = 0; i < children.length; i += 1) {
      const item = children[i];
      switch (item.type) {
        case 'accordion': {
          renderArray.push(this.renderAccordion(item));
          break;
        }
        case 'anchor': {
          renderArray.push(this.renderAnchor(item));
          break;
        }
        default:
          renderArray.push(this.renderMenuItem(item));
          break;
      }
    }
    return renderArray;
  };

  render() {
    const { classes } = this.props;
    let { menu } = this.props;
    if (!menu) {
      menu = {
        children: [],
      };
    }
    const { selectedTab } = this.state;

    return (
      <React.Fragment>
        <AppBar id="this-is-app-bar" position="static" color="default">
          <Tabs
            id="this-is-tabs"
            value={selectedTab}
            classes={{ scroller: classes.tabsScroller }}
            onChange={(event, newValue) => {
              this.setState({ selectedTab: newValue });
            }}
            variant="scrollable"
          >
            {menu.children.map((item, index) => {
              if (item.type === 'tab') {
                return <Tab key={item.id} label={item.label} {...a11yProps(index)} />;
              }
              return null;
            })}
          </Tabs>
        </AppBar>
        {menu.children.map((item, index) => {
          if (item.type === 'tab') {
            return (
              <TabPanel id={`tab-panel-${item.id}`} key={item.id} selectedTab={selectedTab} index={index}>
                {this.renderMenu(item.children)}
              </TabPanel>
            );
          }
          return this.renderMenu([item]);
        })}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    menu: state.menu,
  };
};

const LeftMenu = connect(mapStateToProps)(withStyles(styles)(LeftMenuBase));

export { LeftMenu, SideMenuItem };
