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
// @grant        GM_xmlhttpRequest
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @resource     css_fat32 https://fat32.cf/let-gifs.9bf956b9.css
// ==/UserScript==

/* globals GM_config */

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    icon.innerText = 'BetterLET';
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

function isAdFiltered(config, element) {
    return config.style.navigation.hideads;
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

function bindExpandEvent(e) {
    const a = e.querySelector('div.Title > a');
    const url = a.href;
    const options = e.querySelector('span.Options');
    a.addEventListener('click', _ => { togglePreviewFrame(e); _.preventDefault(); });
}

function togglePreviewFrame(e) {
    const frameId = `${e.id}_Preview`;
    let frame = document.querySelector(`#${frameId}`);
    if(frame) { frame.style.display = (frame.style.display == 'none') ? 'block' : 'none'; return; }

    frame = document.createElement('div');
    frame.id = frameId;
    frame.style.width = '100%';
    frame.style.height = '500px';
    e.appendChild(frame);

    const url = e.querySelector('div.Title > a').href;
    const iframe = document.createElement('iframe');
    iframe.onload = () => {
        const document = iframe.contentWindow.document;
        document.documentElement.scrollTop = 0;

        const content = document.querySelector('#content');
        const body = document.body;

        const head = document.querySelector('#Head');
        head.parentNode.removeChild(head);

        const foot = document.querySelector('#Foot');
        foot.parentNode.removeChild(foot);

        const panel = document.querySelector('#Panel');
        panel.parentNode.removeChild(panel);

        const rows = [...document.querySelectorAll('.Row')];
        rows.forEach(row => { row.removeAttribute('class'); });

        const columns = [...document.querySelectorAll('.Column')];
        columns.forEach(column => { column.removeAttribute('class') });

        const tabs = document.querySelector('.Tabs.DiscussionTabs');
        tabs.parentNode.removeChild(tabs);
    };
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    frame.appendChild(iframe);
}

function filterAd(config, element) {
    // NOIDONTTHINKSO
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
        'style.navigation.cardThreads': {
            label: 'Card Threads',
            type: 'checkbox',
            default: false,
            section: ['Navigation', '']
        },
        'style.navigation.hideads': {
            label: 'Hide Ads',
            type: 'checkbox',
            default: false,
            section: ['', '']
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
            navigation: {
                hideads: GM_config.get('style.navigation.hideads'),
                cardThreads: GM_config.get('style.navigation.cardThreads'),
            },
        },
    };

    config.style.externalcss.forEach(e => { if(e.enabled) GM_addStyle(GM_getResourceText(e.id)); });

    const menu = document.querySelector("div[class='MeMenu']");
    addSettingsButton(config, menu);

    const threads = [...document.querySelectorAll("li[id^='Discussion_']")];
    if(config.style.navigation.cardThreads) threads.forEach(bindExpandEvent);
    /*threads.forEach(thread => {
        const lastComment = thread.querySelector('.LastCommentBy');
        lastComment.style.display = 'none';
    });*/
    threads.filter(e => isThreadFiltered(config, e)).forEach(e => filterThread(config, e));

    const comments = [...document.querySelectorAll("li[id^='Comment_']")];
    comments.filter(e => isCommentFiltered(config, e)).forEach(e => filterComment(config, e));

    const ads = [
        ...document.querySelectorAll("div[class='BoxFilter BoxDiscussionFilter'] ~ div:not(.Box):not(.BoxCategories)"),
        document.querySelector("#Foot > a"),
    ];
    ads.filter(e => isAdFiltered(config, e)).forEach(e => filterAd(config, e));

     /*const editorButtonAnchor = document.querySelector('div.editor-dropdown-image');
     const gifDiv = editorButtonAnchor.cloneNode(true);
     const a = gifDiv.querySelector('.editor-insert-dialog');
     a.style.display = 'none';
     editorButtonAnchor.parentNode.insertBefore(gifDiv, editorButtonAnchor.nextSibling);*/
})();

