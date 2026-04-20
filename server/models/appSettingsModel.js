const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
    // Sentinel key so we always have exactly one document
    _singleton: {
        type: String,
        default: 'global',
        unique: true,
        immutable: true,
    },
    sortMode: {
        type: String,
        enum: ['recent', 'random'],
        default: 'recent',
    },
});

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

// Helper: get (or auto-create) the singleton settings doc
const getSettings = async () => {
    let settings = await AppSettings.findOne({ _singleton: 'global' });
    if (!settings) {
        settings = await AppSettings.create({ _singleton: 'global' });
    }
    return settings;
};

module.exports = { AppSettings, getSettings };
