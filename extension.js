const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const extensionName = Me.metadata.name;
const { TOGGLE_STATUS } = Me.imports.enums.ToggleStatus;
const { Gio, GObject, St } = imports.gi;
const { main: Main, panelMenu: PanelMenu } = imports.ui;
const panel = Main.panel;

const ClosedIcon = 'closed-symbolic';
const OpenedIcon = 'opened-symbolic';

let icon = null;
let itemsToHide = [];
let panelButton = null;
let toggleStatus = TOGGLE_STATUS.INACTIVE;

// TODO add support to: logoMenu, Replace Activities, Bluetooth Battery Indicator, Aylur's widgets date and morere
const excludedPropertyNames = ['a11y', 'activities', 'appMenu', 'dateMenu', 'dwellClick', 'keyboard', 'menuButton', 'screenRecording', 'screenSharing', 'uniteDesktopLabel'];

const excludedItems = Object.keys(panel.statusArea).reduce((result, key) => {
  if (excludedPropertyNames.includes(key)) {
    result.push(panel.statusArea[key]);
  }

  return result;
}, []);

function toggleItems(items, mode) {
  const action = mode === 'hide' ? 'hide' : 'show';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item[action]();
  }
}

function processLeftBox() {
  const leftBox = panel._leftBox.get_children();

  for (let i = 0; i < leftBox.length; i++) {
    const item = leftBox[i];
    const child = item.get_child();
    
    if (!excludedItems.includes(child)
          && child !== panel.statusArea['barmanButton']
          && child !== panel.statusArea['menuButton']
          && !String(child).includes('ActivitiesButton')
        ) {
      itemsToHide.push(child);
    }
  }
}

function processCenterBox() {
  const centerBox = panel._centerBox.get_children();

  for (let i = 0; i < centerBox.length; i++) {
    const item = centerBox[i];
    const child = item.get_child();

    if (!excludedItems.includes(child)
          && child !== panel.statusArea['barmanButton']
          && child !== panel.statusArea['menuButton']
          && !String(child).includes('ActivitiesButton')
        ) {
      itemsToHide.push(child);
    }
  }
}

function processRightBox() {
  const rightBox = panel._rightBox.get_children();

  for (let i = 0; i < rightBox.length; i++) {
    const item = rightBox[i];
    const child = item.get_child();
    
    if (!excludedItems.includes(child)
          && child !== panel.statusArea['barmanButton']
          && child !== panel.statusArea['menuButton']
          && !String(child).includes('ActivitiesButton')
        ) {
      itemsToHide.push(child);
    }
  }
}

function toggleBarman() {
  processLeftBox();
  processCenterBox();
  processRightBox();
  toggleItems(itemsToHide, 'hide');

  if (toggleStatus === TOGGLE_STATUS.INACTIVE) {
    toggleStatus = TOGGLE_STATUS.ACTIVE;
    toggleItems(itemsToHide, 'hide');
    icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/${ClosedIcon}.svg`)
  } else if (toggleStatus === TOGGLE_STATUS.ACTIVE) {
    toggleStatus = TOGGLE_STATUS.INACTIVE;
    toggleItems(itemsToHide, 'show');
    icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/${OpenedIcon}.svg`)
  }
}

function resetToggleStatus() {
  toggleStatus = TOGGLE_STATUS.INACTIVE;
  toggleItems(itemsToHide, 'show');
  itemsToHide = [];
}

function getPanelButton() {
  panelButton = new PanelMenu.Button(0.0, `${extensionName}`, false);
  panelButton.add_child(icon);
  panelButton.connect('button-press-event', toggleBarman);
  return panelButton;
}

function addButton() {
  icon = new St.Icon({
    gicon: Gio.icon_new_for_string(`${Me.path}/icons/${OpenedIcon}.svg`),
    style_class: 'system-status-icon'
  });;
  panel.addToStatusArea('barmanButton', getPanelButton(), 99);
}

function removeButton() {
  resetToggleStatus();
  icon = null;
  panelButton.destroy();
  panelButton = null;
}

function init() {
  log(`initializing ${extensionName}`);
}

function enable() {
  addButton();
}

function disable() {
  removeButton();
}
