const Main = imports.ui.main;
const panel = Main.panel;

const a11y = panel.statusArea['a11y'];
const activitiesButton = panel.statusArea['activities'];
const dateMenu = panel.statusArea['dateMenu'];
const dwellClick = panel.statusArea['dwellClick'];
const keyboardMenu = panel.statusArea['keyboard'];
const screenRecording = panel.statusArea['screenRecording'];
const screenSharing = panel.statusArea['screenSharing'];
const quickSettings = panel.statusArea['quickSettings'];

const panelBoxs = [
  panel._leftBox.get_children(),
  panel._centerBox.get_children(),
  panel._rightBox.get_children()
];

const processItems = (items) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const child = item.get_child();

    if (child !== a11y && child !== activitiesButton && child !== dateMenu && child !== dwellClick && child !== keyboardMenu && child !== screenRecording && child !== screenSharing) {
      itemsToHide.push(child);
    }
  }
};

const itemsToHide = [];

function toggleItems(items, mode) {
  const action = mode === 'hide' ? 'hide' : 'show';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item[action]();
  }
}

function init() {
  log('initializing barman');
}

function enable() {
  panelBoxs.forEach(processItems);
  toggleItems(itemsToHide, 'hide');
}

function disable() {
  panelBoxs.forEach(processItems);
  toggleItems(itemsToHide, 'show');
}
