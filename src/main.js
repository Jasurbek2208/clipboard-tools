"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clipboard = void 0;
var ClipboardTools = /** @class */ (function () {
    function ClipboardTools() {
        this.liveRegion = null;
        this.listeners = {};
        this.createLiveRegion();
    }
    ClipboardTools.prototype.createLiveRegion = function () {
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.style.position = 'absolute';
        this.liveRegion.style.width = '1px';
        this.liveRegion.style.height = '1px';
        this.liveRegion.style.overflow = 'hidden';
        this.liveRegion.style.clip = 'rect(1px,1px,1px,1px)';
        this.liveRegion.style.clipPath = 'inset(50%)';
        this.liveRegion.style.margin = '-1px';
        this.liveRegion.style.border = '0';
        document.body.appendChild(this.liveRegion);
    };
    ClipboardTools.prototype.announce = function (message) {
        var _this = this;
        if (this.liveRegion) {
            this.liveRegion.textContent = '';
            setTimeout(function () {
                if (_this.liveRegion)
                    _this.liveRegion.textContent = message;
            }, 100);
        }
    };
    ClipboardTools.prototype.on = function (event, cb) {
        if (!this.listeners[event])
            this.listeners[event] = [];
        this.listeners[event].push(cb);
    };
    ClipboardTools.prototype.off = function (event, cb) {
        if (!this.listeners[event])
            return;
        this.listeners[event] = this.listeners[event].filter(function (f) { return f !== cb; });
    };
    ClipboardTools.prototype.emit = function (event) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (_a = this.listeners[event]) === null || _a === void 0 ? void 0 : _a.forEach(function (cb) { return cb.apply(void 0, args); });
    };
    ClipboardTools.prototype.fallbackCopyText = function (text) {
        try {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.top = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            var successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            return successful;
        }
        catch (err) {
            console.error('Fallback copy failed:', err);
            return false;
        }
    };
    ClipboardTools.prototype.copy = function (value_1) {
        return __awaiter(this, arguments, void 0, function (value, options) {
            var _a, type, _b, showToast, _c, toastDuration, secureTTL, _d, onSuccess, _e, onError, _f, appendTimestamp, _g, includeHost, _h, htmlFallbackText, _j, i18n, _k, ariaLive, dataToCopy, encoded, ts, blob, clipboardItem, fallbackSuccess, err_1;
            var _this = this;
            var _l, _m;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        _a = options.type, type = _a === void 0 ? 'text' : _a, _b = options.showToast, showToast = _b === void 0 ? true : _b, _c = options.toastDuration, toastDuration = _c === void 0 ? 3000 : _c, secureTTL = options.secureTTL, _d = options.onSuccess, onSuccess = _d === void 0 ? function () { return showToast && _this.showToast('Copied!'); } : _d, _e = options.onError, onError = _e === void 0 ? function (err) { return showToast && _this.showToast('Copy failed'); } : _e, _f = options.appendTimestamp, appendTimestamp = _f === void 0 ? false : _f, _g = options.includeHost, includeHost = _g === void 0 ? true : _g, _h = options.htmlFallbackText, htmlFallbackText = _h === void 0 ? '' : _h, _j = options.i18n, i18n = _j === void 0 ? { copied: 'Copied!', failed: 'Copy failed' } : _j, _k = options.ariaLive, ariaLive = _k === void 0 ? true : _k;
                        dataToCopy = value;
                        if (type === 'link') {
                            encoded = encodeURIComponent(value);
                            dataToCopy = "".concat(includeHost ? window.location.origin : '').concat(window.location.pathname, "#:~:text=").concat(encoded);
                        }
                        else if (type === 'url') {
                            dataToCopy = window.location.href;
                        }
                        if (appendTimestamp) {
                            ts = new Date().toISOString();
                            dataToCopy += "?t=".concat(ts);
                        }
                        _o.label = 1;
                    case 1:
                        _o.trys.push([1, 10, , 11]);
                        if (!(type === 'html')) return [3 /*break*/, 5];
                        if (!((_l = navigator.clipboard) === null || _l === void 0 ? void 0 : _l.write)) return [3 /*break*/, 3];
                        blob = new Blob([value], { type: 'text/html' });
                        clipboardItem = new ClipboardItem({ 'text/html': blob });
                        return [4 /*yield*/, navigator.clipboard.write([clipboardItem])];
                    case 2:
                        _o.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.fallbackCopyText(htmlFallbackText || value);
                        _o.label = 4;
                    case 4: return [3 /*break*/, 9];
                    case 5:
                        if (!(type === 'image')) return [3 /*break*/, 6];
                        // You may add image copying logic here
                        throw new Error('Image copy not implemented yet');
                    case 6:
                        if (!((_m = navigator.clipboard) === null || _m === void 0 ? void 0 : _m.writeText)) return [3 /*break*/, 8];
                        return [4 /*yield*/, navigator.clipboard.writeText(dataToCopy)];
                    case 7:
                        _o.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        fallbackSuccess = this.fallbackCopyText(dataToCopy);
                        if (!fallbackSuccess)
                            throw new Error('Clipboard fallback failed');
                        _o.label = 9;
                    case 9:
                        this.emit('copy', dataToCopy);
                        if (ariaLive)
                            this.announce(i18n.copied);
                        onSuccess();
                        if (secureTTL) {
                            setTimeout(function () {
                                navigator.clipboard.writeText('').catch(console.warn);
                            }, secureTTL);
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        err_1 = _o.sent();
                        this.emit('copy', null, err_1);
                        if (ariaLive)
                            this.announce(i18n.failed);
                        console.error('Clipboard error:', err_1);
                        onError(err_1);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    ClipboardTools.prototype.paste = function () {
        return __awaiter(this, void 0, void 0, function () {
            var text, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, navigator.clipboard.readText()];
                    case 1:
                        text = _a.sent();
                        this.emit('paste', text);
                        return [2 /*return*/, text || null];
                    case 2:
                        err_2 = _a.sent();
                        this.emit('paste', null, err_2);
                        console.error('Paste failed:', err_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClipboardTools.prototype.cut = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            var successful;
            return __generator(this, function (_a) {
                try {
                    if (!element)
                        throw new Error('Element not provided');
                    element.select();
                    successful = document.execCommand('cut');
                    this.emit('cut', element.value);
                    return [2 /*return*/, successful];
                }
                catch (err) {
                    this.emit('cut', null, err);
                    console.error('Cut failed:', err);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    ClipboardTools.prototype.showToast = function (message) {
        // Minimal toast, extendable to your preferred UI framework
        var toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#333';
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '9999';
        toast.style.opacity = '0.9';
        document.body.appendChild(toast);
        setTimeout(function () { return document.body.removeChild(toast); }, 3000);
    };
    return ClipboardTools;
}());
exports.clipboard = new ClipboardTools();
