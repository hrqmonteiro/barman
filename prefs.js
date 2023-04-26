const {Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();

/* prefs initiation
 */
function init() {
}

/* prefs widget
 */
function buildPrefsWidget() {

    let settings = ExtensionUtils.getSettings();

    let builder = new Gtk.Builder();
    builder.add_from_file(Me.dir.get_child('prefs.ui').get_path());

    let panelPosition = settings.get_enum('panel-position');
    let comboBox = builder.get_object('panelButtonPosition_combobox');

    comboBox.set_active(panelPosition);

    comboBox.connect('changed', w => {
        let value = w.get_active();
        settings.set_enum('panel-position', value);
    });

    return builder.get_object('main_prefs');
}
