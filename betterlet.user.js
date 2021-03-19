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

function joyifyAd(config, element) {
    const adImageReplacements = [
        'https://media.tenor.com/images/69835c92b959e460edfc6ad7f6f9e61c/tenor.gif',
        'https://i.kym-cdn.com/photos/images/newsfeed/001/117/432/515.gif',
        'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/53220c91-0c3c-4cd9-92e3-0152ff27a86c/dd24v4o-187f0036-d179-40c4-b9a0-fc72d67989d8.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzUzMjIwYzkxLTBjM2MtNGNkOS05MmUzLTAxNTJmZjI3YTg2Y1wvZGQyNHY0by0xODdmMDAzNi1kMTc5LTQwYzQtYjlhMC1mYzcyZDY3OTg5ZDguZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.3IOyaG-veVLGmNpHIyta5s40b0U12HoNASmE4nWEZbM',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS753V3owMmBI4pK125Nej3RNHqMR3bx_9yZw&usqp=CAU',
        'https://i.redd.it/5kajy4ncbl411.png',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMyBgqrtSYb-98JaYYtuoIiipsCxy9Sc-8Qw&usqp=CAU',
    ];

    const images = [...element.querySelectorAll('img')];
    images.forEach(e => {
        e.src = adImageReplacements[getRandomInt(0, adImageReplacements.length - 1)];
        e.style.width = '250px';
        e.style.height = '250px';
    });

    const anchors = [
        element.querySelectorAll('a'),
        ...(element.tagName.toLowerCase() === 'a' ? [element] : []),
    ];
    anchors.forEach(e => { e.href = 'https://www.clownsinternational.com/' });
}

function filterAd(config, element) {
    // NOIDONTTHINKSO
    joyifyAd(config, element);
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
        'style.navigation.hideads': {
            label: 'Hide Ads',
            type: 'checkbox',
            default: false,
            section: ['Navigation', '']
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
            },
        },
    };

    config.style.externalcss.forEach(e => { if(e.enabled) GM_addStyle(GM_getResourceText(e.id)); });

    const menu = document.querySelector("div[class='MeMenu']");
    addSettingsButton(config, menu);

    const threads = [...document.querySelectorAll("li[id^='Discussion_']")];
    threads.filter(e => isThreadFiltered(config, e)).forEach(e => filterThread(config, e));

    const comments = [...document.querySelectorAll("li[id^='Comment_']")];
    comments.filter(e => isCommentFiltered(config, e)).forEach(e => filterComment(config, e));

    const ads = [
        ...document.querySelectorAll("div[class='BoxFilter BoxDiscussionFilter'] ~ div:not(.Box):not(.BoxCategories)"),
        document.querySelector("#Foot > a"),
    ];
    ads.filter(e => isAdFiltered(config, e)).forEach(e => filterAd(config, e));
})();

