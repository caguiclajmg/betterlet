// ==UserScript==
// @name         BetterLET
// @namespace    http://guarandoo.me
// @version      1.0
// @description  LowEndTalk userscript
// @author       jmg.caguicla
// @match        https://www.lowendtalk.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @resource     css_fat32 https://fat32.cf/let-gifs.9bf956b9.css
// ==/UserScript==

/* globals GM_config */

function addSettingsButton(config, parent) {
    const span = document.createElement('span');
    span.className = 'ToggleFlyout';
    span.style.cursor = 'pointer';
    span.addEventListener('click', e => GM_config.open());
    parent.appendChild(span);

    const anchor = document.createElement('a');
    span.appendChild(anchor);
    anchor.className = 'MeButton';

    const icon = document.createElement('span');
    icon.innerText = 'í±€';
    anchor.appendChild(icon);

    return span;
}

function isThreadFiltered(config, element) {
    const user = element.querySelector('a:first-of-type').title;
    if(config.thread.filter.users.includes(user)) return true;

    const title = element.querySelector("[class='Title'] > a").innerText;
    if(config.thread.filter.titles && config.thread.filter.titles.test(title)) return true;

    return false;
}

function isCommentFiltered(config, element) {
    const user = element.querySelector("*[class='Author'] > a:first-of-type").title;
    if(config.comment.filter.users.includes(user)) return true;

    return false;
}

function filterThread(config, element) {
    switch(config.thread.filter.action) {
        case 'Hide':
            element.style.display = 'none';
            break;

        case 'Sink':
            const parent = element.parentNode;
            parent.removeChild(element);
            parent.appendChild(element);
            break;
    }
}

function filterComment(config, element) {
    element.style.display = 'none';
}

GM_config.init({
    id: 'lowendtalk',
    title: 'BetterLET',
    fields: {
        'thread.filter.users': {
            label: 'Filter by user (comma-separated)',
            type: 'text',
            default: '',
            section: ['Thread Filtering', '']
        },
        'thread.filter.titles': {
            label: 'Filter by title (RegEx)',
            type: 'text',
            default: ''
        },
        'thread.filter.action': {
            label: 'Action',
            type: 'radio',
            options: ['Hide', 'Sink'],
            default: 'Hide'
        },
        'comment.filter.users': {
            label: 'Filter by user (comma-separated)',
            type: 'text',
            default: '',
            section: ['Comment Filtering', '']
        },
        'style.externalcss.fat32': {
            label: 'FAT32',
            type: 'checkbox',
            default: false,
            section: ['External Stylesheets', '']
        },
    },
    'events': {
        'save': () => { alert('Settings saved!\nRefresh the page for changes to take effect.'); GM_config.close(); },
    },
});

(function() {
    'use strict';

    const config = {
        thread: {
            filter: {
                users: GM_config.get('thread.filter.users') ? GM_config.get('thread.filter.users').split(',') : [],
                titles: GM_config.get('thread.filter.titles') ? new RegExp(GM_config.get('thread.filter.titles')) : null,
                action: GM_config.get('thread.filter.action') || 'Hide'
            },
        },
        comment: {
            filter: {
                users: GM_config.get('comment.filter.users') ? GM_config.get('comment.filter.users').split(',') : [],
            },
        },
        style: {
            externalcss: [
                { id: 'css_fat32', enabled: GM_config.get('style.externalcss.fat32') },
            ],
        },
    };

    config.style.externalcss.forEach(e => { if(e.enabled) GM_addStyle(GM_getResourceText(e.id)); });

    const menu = document.querySelector("div[class='MeMenu']");
    addSettingsButton(config, menu);

    const threads = [...document.querySelectorAll("li[id^='Discussion_']")];
    threads.filter(e => isThreadFiltered(config, e)).forEach(e => filterThread(config, e));

    const comments = [...document.querySelectorAll("li[id^='Comment_']")];
    comments.filter(e => isCommentFiltered(config, e)).forEach(e => filterComment(config, e));
})();
