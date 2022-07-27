(function () {
function replaceRollsCallback(match, replaceCB) {
    let dice = match[2];
    let modifiers = match[3];
    if (dice === undefined) {
        dice = "";
        modifiers = match[4];
    }
    if (modifiers) {
        modifiers = modifiers.replace(/−/g, "-");
    }
    dice = dice.replace("D", "d");

    const replacement = replaceCB(dice, modifiers);
    if (replacement === null) return match[0];
    else return `${match[1]}${replacement}${match[5]}`;
}

function replaceRolls(text, replaceCB) {
    // TODO: Cache the value so we don't recompile the regexp every time
    const dice_regexp = new RegExp(/(^|[^\w])(?:(?:(?:(\d*[dD]\d+(?:ro(?:=|<|<=|>|>=)[0-9]+)?(?:min[0-9]+)?)((?:(?:\s*[-−+]\s*\d+)|(?:\s*[0+]\s*\d*[dD]\d+))*))|((?:[-−+]\s*\d+)+)))($|[^\w])/, "gm");
    return text.replace(dice_regexp, (...match) => replaceRollsCallback(match, replaceCB));
}

// Used to clean various dice.includes(imperfections) roll strings;
function cleanRoll(rollText) {
    //clean adjacent '+'s (Roll20 treats it as a d20);
    //eg: (1d10 + + 2 + 3) -> (1d10 + 2 + 3);
    rollText = (rollText || "").toString();
    rollText = rollText.replace(/\+ \+/g, '+').replace(/\+ \-/g, '-');
    return rollText;
}

// Taken from https://stackoverflow.com/questions/45985198/the-best-practice-to-detect-whether-a-browser-extension-is-running-on-chrome-or;
function getBrowser() {
    if (typeof (chrome) !== "undefined") {
        if (typeof (browser) !== "undefined") {
            return "Firefox";
        } else {
            return "Chrome";
        }
    } else {
        return "Edge";

    }
}

function getPlatform() {
    let platform;
    if (navigator.userAgentData && navigator.userAgentData.platform) {
        // This is the official way to do it but it's not supported by anything but Edge
        platform = navigator.userAgentData.platform;
    } else if (navigator.platform) {
        // And this is supposed to be deprecated...
        platform = navigator.platform;
    } else {
        return "Unknown";
    }
    if (platform.includes("Windows") || platform.includes("Win32")) {
        return "Windows";
    } else if (platform.includes("Mac")) {
        return "Mac";
    } else {
        return platform;
    }
}

function isExtensionDisconnected() {
    try {
        chrome.runtime.getURL("");
        return false;
    } catch (err) {
        return true;
    }
}

// Taken from https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script;
function injectPageScript(url) {
    const s = document.createElement('script');
    s.src = url;
    s.charset = "UTF-8";
    s.onload = () => s.remove();
    (document.head || document.documentElement).appendChild(s);
}

function injectCSS(css) {
    const s = document.createElement('style');
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
}

function sendCustomEvent(name, data=[]) {
    if (getBrowser() === "Firefox")
        data = cloneInto(data, window);
    const event = new CustomEvent("Beyond20_" + name, { "detail": data });
    document.dispatchEvent(event);
}

function addCustomEventListener(name, callback) {
    const event = ["Beyond20_" + name, (evt) => {
        const detail = evt.detail || [];
        callback(...detail)
    }, false];
    document.addEventListener(...event);
    return event;
}

function roll20Title(title) {
    return title.replace(" | Roll20", "");
}

function isFVTT(title) {
    return title.includes("Foundry Virtual Tabletop");
}

function isAstral(title) {
    return title.includes("Astral TableTop");
}

function fvttTitle(title) {
    return title.replace(" • Foundry Virtual Tabletop", "");
}

function astralTitle(title) {
    return title.replace(" | Astral TableTop", "");
}

function urlMatches(url, matching) {
    return url.match(matching.replace(/\*/g, "[^]*")) !== null;
}

function isCustomDomainUrl(tab) {
    // FVTT is handled separately from custom domains
    if (isFVTT(tab.title)) return false;
    for (const url of ((settings || {})["custom-domains"] || [])) {
        if (urlMatches(tab.url, url)) return true;
    }
    return false;
}
function alertSettings(url, title) {
    if (alertify.Beyond20Settings === undefined)
        alertify.dialog('Beyond20Settings', function () { return {}; }, false, "alert");

    const popup = chrome.runtime.getURL(url);
    const img = E.img({src: chrome.runtime.getURL("images/icons/icon32.png"), style: "margin-right: 3px;"})
    const iframe = E.iframe({src: popup, style: "width: 100%; height: 100%;", frameborder: "0", scrolling: "yes"});
    const dialog = alertify.Beyond20Settings(img.outerHTML + title, iframe);
    const width = Math.min(720, window.innerWidth / 2); // 720px width or 50% on small screens
    dialog.set('padding', false).set('resizable', true).set('overflow', false).resizeTo(width, "80%");

}
function alertQuickSettings() {
    alertSettings("popup.html", "Beyond 20 Quick Settings");
}
function alertFullSettings() {
    alertSettings("options.html", "Beyond 20 Settings");
}

function isListEqual(list1, list2) {
    const list1_str = list1.join(",");
    const list2_str = list2.join(",");
    return list1_str == list2_str;

}
function isObjectEqual(obj1, obj2) {
    const obj1_str = Object.entries(obj1).join(",");
    const obj2_str = Object.entries(obj2).join(",");
    return obj1_str == obj2_str;
}

// replaces matchAll, requires a non global regexp
function reMatchAll(regexp, string) {
    const matches = string.match(new RegExp(regexp, "gm"));
    if ( matches) {
        let start = 0;
        return matches.map(group0 => {
            const match = group0.match(regexp);
            match.index = string.indexOf(group0, start);
            start = match.index;
            return match;
        });
    }
    return matches;
}

/**
 * Some users somehow inject html into their comments which include alertify classes
 * which can negatively impact how the page renders. We should remove those in order
 * to clean up the page
 */
function cleanupAlertifyComments() {
    const comments = $(".listing-comments");
    comments.find(".alertify, .alertify-notifier").remove();
}

E = new Proxy({}, {
    get: function (obj, name) {
        return new Proxy(function () {}, {
            apply: (target, thisArg, argumentsList) => {
                const attributes = argumentsList[0] || {};
                const children = argumentsList.slice(1);
                const e = document.createElement(name);
                for (const [name, value] of Object.entries(attributes))
                    e.setAttribute(name, value);
                for (const child of children)
                    e.append(child);
                return e;
            }
        });
    }
});


function initializeAlertify() {
    alertify.set("alert", "title", "Beyond 20");
    alertify.set("notifier", "position", "top-center");
    
    alertify.defaults.transition = "zoom";
    if (alertify.Beyond20Prompt === undefined) {
        const factory = function () {
            return {
                "settings": {
                    "content": undefined,
                    "ok_label": undefined,
                    "cancel_label": undefined,
                    "resolver": undefined,
                },
                "main": function (title, content, ok_label, cancel_label, resolver) {
                    this.set('title', title);
                    this.set('content', content);
                    this.set('resolver', resolver);
                    this.set('ok_label', ok_label);
                    this.set("cancel_label", cancel_label);
                },
                "setup": () => {
                    return {
                        "buttons": [
                            {
                                "text": alertify.defaults.glossary.ok,
                                "key": 13, //keys.ENTER;
                                "className": alertify.defaults.theme.ok,
                            },
                            {
                                "text": alertify.defaults.glossary.cancel,
                                "key": 27, //keys.ESC;
                                "invokeOnClose": true,
                                "className": alertify.defaults.theme.cancel,
                            }
                        ],
                        "focus": {
                            "element": 0,
                            "select": true
                        },
                        "options": {
                            "maximizable": false,
                            "resizable": false
                        }
                    }
                },
                "build": () => { },
                "prepare": function () {
                    this.elements.content.innerHTML = this.get('content');
                    this.__internal.buttons[0].element.innerHTML = this.get('ok_label');
                    this.__internal.buttons[1].element.innerHTML = this.get('cancel_label');
                },
                "callback": function (closeEvent) {
                    if (closeEvent.index == 0) {
                        this.get('resolver').call(this, $(this.elements.content.firstElementChild));
                    } else {
                        this.get('resolver').call(this, null);
                    }
                }
            }
        }
        alertify.dialog('Beyond20Prompt', factory, false, "prompt");
    }
    
    
    if (alertify.Beyond20Roll === undefined)
        alertify.dialog('Beyond20Roll', function () { return {}; }, false, "alert");
    
}


class DDBMessageBroker {
    constructor() {
        this._mb = null;
        this._messageQueue = [];
        this._blockMessages = [];
        this._hooks = {};
        this._characterId = (window.location.pathname.match(/\/characters\/([0-9]+)/) || [])[1];
        this.saveMessages = false;
        this._debug = false;
    }
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    register() {
        if (this._mb) return;
        const key = Symbol.for('@dndbeyond/message-broker-lib')
        if (key)
            this._mb = window[key];
        if (!this._mb) return;
        this._mb.subscribe(this._onMessage.bind(this));
        this._mbDispatch = this._mb.dispatch.bind(this._mb);
        this._mb.dispatch = this._onDispatchMessage.bind(this);
    }
    unregister() {
        if (!this._mb) return;
        if (this._mbDispatch) {
            this._mb.dispatch = this._mbDispatch;
            this._mbDispatch = null;
        }
        // We can't unsubscribe from the _onMessage
        this._mb = null;
    }
    /**
     * Hook on events from the message broker of a particular type
     */
    on(event, callback, {once=false, send=true, recv=true}={}) {
        const callbacks = this._hooks[event] || [];
        callbacks.push({callback, once, send, recv});
        this._hooks[event] = callbacks;
    }
    _dispatchHooks(eventType, message, recv) {
        let stopPropagation = false;
        const hooks = this._hooks[eventType] || [];
        for (let idx = 0; idx < hooks.length; idx++) {
            const hook = hooks[idx];
            if (recv && !hook.recv) continue;
            if (!recv && !hook.send) continue;
            if (hook.once) {
                hooks.splice(idx, 1);
                idx--;
            }
            stopPropagation |= hook.callback(message) === false;
            if (stopPropagation) break;
        }
        return stopPropagation;
    }
    _onMessage(message) {
        // Check if we unregistered
        if (!this._mb) return;
        if (this._debug) console.log("Received ", message);
        if (this.saveMessages) {
            this._messageQueue.push(message);
        }
        if (this._dispatchHooks(message.eventType, message, true)) return;
        this._dispatchHooks(null, message, true);
    }
    _onDispatchMessage(message) {
        if (this._debug) console.log("Dispatching ", message);
        const blockIndex = this._blockMessages.findIndex(msg => msg.type === message.eventType);
        if (blockIndex !== -1) {
            if (this._blockMessages[blockIndex].once) {
                this._blockMessages.splice(blockIndex, 1);
            }
            if (this._debug) console.log("Dropped message ", message);
            return;
        }
        if (this._dispatchHooks(message.eventType, message, false)) return;
        if (this._dispatchHooks(null, message, false)) return;
        this._mbDispatch(message);
    }
    blockMessages(msg) {
        this.register();
        this._blockMessages.push(msg);
    }
    getPendingMessages(type) {
        this.register();
        return this._messageQueue.filter(m => m.eventType === type);
    }
    getContext(character) {
        const context = {};
        context.messageScope = this._mb.gameId == '0' ? "userId" : "gameId";
        if (context.messageScope === "gameId") {
            context.messageTarget = this._mb.gameId;
        }
        if (context.messageScope === "userId") {
            context.messageTarget = this._mb.userId;
        }
        context.entityType = this._characterId ? "character" : "user";
        if (context.entityType === "character" && this._characterId) {
            context.entityId = this._characterId;
        }
        if (context.entityType === "user") {
            context.entityId = this._mb.userId;
        }
        if (character) {
            context.name = character.name;
            context.avatarUrl = character.avatar;
        }
        return context;
    }
    postMessage(data) {
        this.register();
        if (!this._mb) return;
        data.id = data.id || this.uuid(),
        data.dateTime = String(data.dateTime || Date.now());
        data.source = data.source || "Beyond20";
        data.persist = data.persist || false;
        const defaultScope = this._mb.gameId == '0' ? "userId" : "gameId";
        const defaultType = this._characterId ? "character" : "user";
        data.messageScope = data.messageScope || defaultScope;
        if (data.messageScope === "gameId") {
            data.messageTarget = data.messageTarget || this._mb.gameId;
        }
        if (data.messageScope === "userId") {
            data.messageTarget = data.messageTarget || this._mb.userId;
        }
        data.entityType = data.entityType || defaultType;
        if (data.entityType === "character" && this._characterId) {
            data.entityId = data.entityId || this._characterId;
        }
        if (data.entityType === "user") {
            data.entityId = data.entityId || this._mb.userId;
        }
        if (this._mb.gameId != '0') {
            data.gameId = data.gameId || this._mb.gameId;
        }
        data.userId = data.userId || this._mb.userId;
        this._mb.dispatch(data);
    }
    flush() {
        this._messageQueue.length = 0;
    }
}
const messageBroker = new DDBMessageBroker();
messageBroker.register();
console.log("Registered Beyond20 message broker");

let lastCharacter = null;
function sendRollToGameLog(request) {
	const message = {
        persist: false,
    };
    if (request.action === "roll") {
        message.eventType = "custom/beyond20/request";
        message.data = {
            'request': request
        }
        // Save the character to be used when creating the default roll data context
        lastCharacter = request.character;
    } else if (request.action === "rendered-roll") {
        message.eventType = "custom/beyond20/roll";
        message.data = {
            'request': request.request,
            'render': request.html
        }
        // Save the character to be used when creating the default roll data context
        lastCharacter = request.character;
	} else {
        // Unknown action type
        return;
    }
	messageBroker.postMessage(message);
}

function rollToDDBRoll(roll, forceResults=false) {
    let constant = 0;
    let lastOperation = '+';
    const sets = [];
    const results = [];
    // constant, total, count, dieValue and result.values must be ints so it doesn't crash the mobile app
    for (const part of roll.parts) {
        if (['-', '+'].includes(part)) {
            lastOperation = part;
        } else if (typeof(part) === "number") {
            constant = constant + parseInt(part) * (lastOperation === "+" ? 1 : -1);
        } else if (part.formula) {
            let operation = 0; // sum
            if (part.modifiers.includes("kl") || part.modifiers.includes("dh"))
                operation = 1; // min
            else if (part.modifiers.includes("kh") || part.modifiers.includes("dl"))
                operation = 2; // max
            // the game log will crash if a message is posted with a dieType that isn't supported
            const dieType = [4, 6, 8, 10, 12, 20, 100].includes(part.faces) ? `d${part.faces}` : 'd100';
            sets.push({
                count: parseInt(part.amount),
                dieType,
                operation,
                dice: part.rolls.filter(r => !r.discarded).map(r => ({dieType, dieValue: r.roll || 0}))
            });
            if (part.total !== undefined) {
                results.push(parseInt(part.total));
            }
        }
    }
    const rollToKind = {
        "critical-damage": "critical hit"
    }
    const rollToType = {
        "to-hit": "to hit",
        "damage": "damage",
        "critical-damage": "damage",
        "skill-check": "check",
        "ability-check": "check",
        "initiative": "check",
        "saving-throw": "save",
        "death-save": "save",

    }

    const data = {
        diceNotation: {
            constant,
            set: sets
        },
        diceNotationStr: roll.formula,
        rollKind: rollToKind[roll.type] || "",
        rollType: rollToType[roll.type] || "roll"
    }
    // diceOperation options: 0 = sum, 1 = min, 2 = max
    // rollKind options : "" = none, advantage, disadvantage, critical hit
    // rollType options : roll, to hit, damage, heal, spell, save, check
    if (forceResults || results.length > 0) {
        data.result = {
            constant,
            text: roll.parts.map(p => p.total === undefined ? String(p) : String(p.total)).join(""),
            total: parseInt(roll.total),
            values: results
        };
    }
    return data;
}

let lastMessage = null;
function pendingRoll(rollData) {
    //console.log("rolling ", rollData);
    messageBroker.on("dice/roll/pending", (message) => {
        lastMessage = message;
        // If no roll data, then simply stop propagation but don't replace it
        if (!rollData) return false;
        messageBroker.postMessage({
            persist: false,
            eventType: "dice/roll/pending",
            entityType: message.entityType,
            entityId: message.entityId,
            gameId: message.gameId,
            messageScope: message.messageScope,
            messageTarget: message.messageTarget,
            userId: message.userId,
            data: {
                action: rollData.name,
                context: message.data.context,
                rollId: message.data.rollId,
                rolls: rollData.rolls.map(r => rollToDDBRoll(r)),
                setId: message.data.setId
            }
        });
        // Stop propagation
        return false;
    }, {once: true, send: true, recv: false});
    messageBroker.blockMessages({type: "dice/roll/fulfilled", once: true});
}
function fulfilledRoll(rollData) {
    //console.log("fulfilled roll ", rollData);
    // In case digital dice are disabled, and we have no previous pending roll message
    // we need to construct a valid one for DDB to parse
    lastMessage = lastMessage || {
        data: {
            context: messageBroker.getContext(lastCharacter),
            rollId: messageBroker.uuid()
        }
    };
    // For initiative to work in the Encounter builder, it needs to have the action name "Initiative" and not "Initiative(+x)" that B20 sends
    const action = /^Initiative/.test(rollData.name) ? "Initiative" : rollData.name;
    messageBroker.postMessage({
        persist: true,
        eventType: "dice/roll/fulfilled",
        entityType: lastMessage.entityType,
        entityId: lastMessage.entityId,
        gameId: lastMessage.gameId,
        messageScope: lastMessage.messageScope,
        messageTarget: lastMessage.messageTarget,
        userId: lastMessage.userId,
        data: {
            action,
            rolls: rollData.rolls.map(r => rollToDDBRoll(r, true)),
            context: lastMessage.data.context,
            rollId: lastMessage.data.rollId,
            setId: lastMessage.data.setId || "8201337" // Not setting it makes it use "Basic Black" by default. Using an invalid value is better
        }
    });
    // Avoid overwriting the old roll in case a roll generates multiple fulfilled rolls (critical hit)
    lastMessage.data.rollId = messageBroker.uuid();
}

function disconnectAllEvents() {
    for (let event of registered_events)
        document.removeEventListener(...event);
    messageBroker.unregister();
}

var registered_events = [];
registered_events.push(addCustomEventListener("rendered-roll", sendRollToGameLog));
registered_events.push(addCustomEventListener("roll", sendRollToGameLog));
registered_events.push(addCustomEventListener("MBPendingRoll", pendingRoll));
registered_events.push(addCustomEventListener("MBFulfilledRoll", fulfilledRoll));
registered_events.push(addCustomEventListener("disconnect", disconnectAllEvents));
})();