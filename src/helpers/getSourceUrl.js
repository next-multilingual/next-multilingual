"use strict";
exports.__esModule = true;
exports.getSourceUrl = void 0;
function getSourceUrl(_a) {
    var rewrites = _a.rewrites, locale = _a.locale, path = _a.path;
    var lcPath = "/" + locale + path;
    var match = rewrites.find(function (_a) {
        var destination = _a.destination, locale = _a.locale;
        return locale === false && destination === lcPath;
    });
    return match ? match.source : lcPath;
}
exports.getSourceUrl = getSourceUrl;
