const { Gio, St } = imports.gi;
const { main: Main, panelMenu: PanelMenu } = imports.ui;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const panel = Main.panel;

const a11y = panel.statusArea['a11y'];
const activitiesButton = panel.statusArea['activities'];
const appMenu = panel.statusArea['appMenu'];
const dateMenu = panel.statusArea['dateMenu'];
const dwellClick = panel.statusArea['dwellClick'];
const keyboardMenu = panel.statusArea['keyboard'];
const screenRecording = panel.statusArea['screenRecording'];
const screenSharing = panel.statusArea['screenSharing'];
const quickSettings = panel.statusArea['quickSettings'];

const extensionName = Me.metadata.name;

const TOGGLE_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
}

let toggleStatus = TOGGLE_STATUS.INACTIVE;

const panelBoxs = [
  panel._leftBox.get_children(),
  panel._centerBox.get_children(),
  panel._rightBox.get_children()
];

const processItems = (items) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const child = item.get_child();

    // TODO add support to: Unite, logoMenu, Replace Activities, Bluetooth Battery Indicator, Aylur's widgets date and more
    if (child !== a11y && child !== activitiesButton && child !== appMenu && child !== dateMenu && child !== dwellClick && child !== keyboardMenu && child !== screenRecording && child !== screenSharing) {
      itemsToHide.push(child);
    }
  }
};

let itemsToHide = [];

function toggleItems(items, mode) {
  const action = mode === 'hide' ? 'hide' : 'show';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item[action]();
  }
}

function toggleBarman() {
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

let panelButton;

function getPanelButton() {
  panelButton = new PanelMenu.Button(0.0, `${extensionName}`, false);

  let icon = new St.Icon({
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
  panelBoxs.forEach(processItems);
}

function enable() {
  addButton();
}

function disable() {
  removeButton();
}
