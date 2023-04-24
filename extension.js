const { Gio, St } = imports.gi;
const { main: Main, panelMenu: PanelMenu } = imports.ui;
const panel = Main.panel;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const extensionName = Me.metadata.name;
const { TOGGLE_STATUS } = Me.imports.enums.ToggleStatus;

let itemsToHide = [];
let panelButton = null;
let toggleStatus = TOGGLE_STATUS.INACTIVE;

// TODO add support to: Unite, logoMenu, Replace Activities, Bluetooth Battery Indicator, Aylur's widgets date and morere
const excludedPropertyNames = ['a11y', 'activities', 'appMenu', 'dateMenu', 'dwellClick', 'keyboard', 'screenRecording', 'screenSharing'];

const excludedItems = Object.keys(panel.statusArea).reduce((result, key) => {
  if (excludedPropertyNames.includes(key)) {
    result.push(panel.statusArea[key]);
  }

  return result;
}, []);

const panelBoxs = [
  panel._leftBox.get_children(),
  panel._centerBox.get_children(),
  panel._rightBox.get_children()
];

function processItems (items) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const child = item.get_child();

    if (!excludedItems.includes(child)) {
      itemsToHide.push(child);
    }
  }
};

function toggleItems(items, mode) {
  const action = mode === 'hide' ? 'hide' : 'show';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item[action]();
  }
}

function toggleBarman() {
  panelBoxs.forEach(processItems);
  toggleItems(itemsToHide, 'hide');

  if (toggleStatus === TOGGLE_STATUS.INACTIVE) {
    toggleStatus = TOGGLE_STATUS.ACTIVE;
    toggleItems(itemsToHide, 'hide');
  } else if (toggleStatus === TOGGLE_STATUS.ACTIVE) {
    toggleStatus = TOGGLE_STATUS.INACTIVE;
    toggleItems(itemsToHide, 'show');
  }
}

function resetToggleStatus() {
  toggleStatus = TOGGLE_STATUS.INACTIVE;
  toggleItems(itemsToHide, 'show');
  itemsToHide = [];
}

function getPanelButton() {
  panelButton = new PanelMenu.Button(0.0, `${extensionName}`, false);

  const icon = new St.Icon({
    icon_name: 'content-loading-symbolic',
    style_class: 'system-status-icon'
  });

  panelButton.add_child(icon);
  panelButton.connect('button-press-event', toggleBarman);
  return panelButton;
}

function addButton() {
  const indicatorName = `${extensionName} Indicator`;
  panel.addToStatusArea(indicatorName, getPanelButton(), 90);
}

function removeButton() {
  resetToggleStatus();
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
