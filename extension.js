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

function keepCondition(child) {
  // TODO add support to Bluetooth Battery Indicator, AppIndicator and more
  const excluded = [
    'a11y',
    'activities',
    'appMenu',
    'barmanButton',
    'dateMenu',
    'dwellClick',
    'keyboard',
    'menuButton',
    'screenRecording',
    'screenSharing',
    'uniteDesktopLabel'
  ]

  const excludedItems = Object.keys(panel.statusArea).reduce((result, key) => {
    if (excluded.includes(key)) {
      result.push(panel.statusArea[key]);
    }

    return result;
  }, []);

  return child
    && !excludedItems.includes(child)
    && !String(child).includes('ActivitiesButton')
}

const boxes = [
  panel._leftBox,
  panel._centerBox,
  panel._rightBox
];

function processBoxes(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const children = box.get_children();

    for (let j = 0; j < children.length; j++) {
      const item = children[j];
      const child = item.get_child();

      if (keepCondition(child)) {
        itemsToHide.push(child);
      }
    }
  }
}

function toggleItems(items, mode) {
  const action = mode === 'hide' ? 'hide' : 'show';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item[action]();
  }
}

function toggleBarman() {
  processBoxes(boxes);
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
  icon = new St.Icon({
    gicon: Gio.icon_new_for_string(`${Me.path}/icons/${OpenedIcon}.svg`),
    style_class: 'system-status-icon'
  });;

  panelButton = new PanelMenu.Button(0.0, `${extensionName}`, false);
  panelButton.add_child(icon);
  panelButton.connect('button-press-event', toggleBarman);
  return panelButton;
}

function addButton() {
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
