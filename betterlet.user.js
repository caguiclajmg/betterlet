// ==UserScript==
// @name         BetterLET
// @namespace    http://guarandoo.me
// @version      1.0
// @description  LowEndTalk userscript
// @author       jmg.caguicla
// @match        https://www.lowendtalk.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// ==/UserScript==

/* globals GM_config */

function createConfigButton(parent) {
    const span = document.createElement('span');
    span.className = 'ToggleFlyout';
    span.style.cursor = 'pointer';
    span.addEventListener('click', e => GM_config.open());
    parent.appendChild(span);

    const a = document.createElement('a');
    span.appendChild(a);
    a.className = 'MeButton';

    const icon = document.createElement('span');
    icon.innerText = 'í±€';
    a.appendChild(icon);
}

function isFiltered(elem) {
    const user = elem.querySelector('a:first-of-type').title;
    if(excludeThreadUsers.includes(user)) return true;

    const titleElement = elem.querySelector("[class='Title'] > a").innerText;
    if(threadTitleRegex && threadTitleRegex.test(titleElement)) return true;

    return false;
}

function filterThread(elem, filterAction) {
    switch(filterAction) {
        case 'Hide':
            elem.style.display = 'none';
            break;

        case 'Sink':
            const parent = elem.parentNode;
            parent.removeChild(elem);
            parent.appendChild(elem);
    }
}

GM_config.init({
    'id': 'lowendtalk',
    'title': 'BetterLET',
    'fields': {
        'HideThreadsByUser': {
            'label': 'Filter threads by user (comma-separated)',
            'type': 'text',
            'default': '',
            'section': ['Thread Filtering', '']
        },
        'HideThreadsByTitle': {
            'label': 'Filter threads with topic (regex)',
            'type': 'text',
            'default': ''
        },
        'FilterAction': {
            'label': 'Filter action',
            'type': 'radio',
            'options': ['Hide', 'Sink'],
            'default': 'Hide'
        },
        'BlockedUsers': {
            'label': 'Block Users (comma-separated)',
            'type': 'text',
            'default': '',
            'section': ['Other Settings', '']
        },
    }
});

const filterAction = GM_config.get('FilterAction');
const excludeThreadUsers = GM_config.get('HideThreadsByUser').split(',');
const excludeThreadsPattern = GM_config.get('HideThreadsByTitle');
const threadTitleRegex = excludeThreadsPattern ? new RegExp(GM_config.get('HideThreadsByTitle')) : null;

(function() {
    'use strict';

    const menu = document.querySelector("div[class='MeMenu']");
    createConfigButton(menu);

    const threads = [...document.querySelectorAll("li[id^='Discussion_']")];
    threads.filter(isFiltered).forEach(elem => filterThread(elem, filterAction));
})();
