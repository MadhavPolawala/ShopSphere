const { getSettings } = require('../models/appSettingsModel');

// @desc    Get current global sort mode
// @route   GET /api/settings/sort
// @access  Public
const getSortMode = async (req, res, next) => {
    try {
        const settings = await getSettings();
        res.json({ sortMode: settings.sortMode });
    } catch (err) {
        next(err);
    }
};

// @desc    Update global sort mode
// @route   PUT /api/settings/sort
// @access  Private/Admin
const setSortMode = async (req, res, next) => {
    try {
        const { sortMode } = req.body;
        if (!['recent', 'random'].includes(sortMode)) {
            return res.status(400).json({ message: 'Invalid sortMode. Use "recent" or "random".' });
        }
        const settings = await getSettings();
        settings.sortMode = sortMode;
        await settings.save();
        res.json({ sortMode: settings.sortMode });
    } catch (err) {
        next(err);
    }
};

module.exports = { getSortMode, setSortMode };
