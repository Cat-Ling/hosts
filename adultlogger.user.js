// ==UserScript==
// @name         Hosts Logger
// @namespace    -
// @version      0.1
// @description  Send every domain queried on the webpage to http://127.0.0.1:3000/resolve/<domain>, with a 10-minute cooldown period. Includes a context menu button to clear the log immediately.
// @author       Cat-Ling
// @homepageURL  https://github.com/Cat-Ling
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nodejs.org
// @match        *://xvideos.com/*
// @match        *://*.xvideos.com/*
// @match        *://xvideos2.com/*
// @match        *://*.xvideos2.com/*
// @match        *://xvideos5.com/*
// @match        *://*.xvideos5.com/*
// @match        *://xvideos.es/*
// @match        *://*.xvideos.es/*
// @match        *://xvapp01.com/*
// @match        *://*.xvapp01.com/*
// @match        *://xvapp02.com/*
// @match        *://*.xvapp02.com/*
// @match        *://xvapp03.com/*
// @match        *://*.xvapp03.com/*
// @match        *://xvapp04.com/*
// @match        *://*.xvapp04.com/*
// @match        *://xvapp05.com/*
// @match        *://*.xvapp05.com/*
// @match        *://spankbang.com/*
// @match        *://*.spankbang.com/*
// @match        *://spankbang.party/*
// @match        *://*.spankbang.party/*
// @match        *://xhamster.com/*
// @match        *://*.xhamster.com/*
// @match        *://xnxx.com/*
// @match        *://*.xnxx.com/*
// @match        *://pornhub.com/*
// @match        *://*.pornhub.com/*
// @match        *://redtube.com/*
// @match        *://*.redtube.com/*
// @match        *://youporn.com/*
// @match        *://*.youporn.com/*
// @match        *://tube8.com/*
// @match        *://*.tube8.com/*
// @match        *://chaturbate.com/*
// @match        *://*.chaturbate.com/*
// @match        *://myfreecams.com/*
// @match        *://*.myfreecams.com/*
// @match        *://livejasmin.com/*
// @match        *://*.livejasmin.com/*
// @match        *://eporner.com/*
// @match        *://*.eporner.com/*
// @match        *://xhamsterlive.com/*
// @match        *://*.xhamsterlive.com/*
// @match        *://motherless.com/*
// @match        *://*.motherless.com/*
// @match        *://efukt.com/*
// @match        *://*.efukt.com/*
// @match        *://youjizz.com/*
// @match        *://*.youjizz.com/*
// @match        *://fapdu.com/*
// @match        *://*.fapdu.com/*
// @match        *://porn.com/*
// @match        *://*.porn.com/*
// @match        *://vxxx.com/*
// @match        *://*.vxxx.com/*
// @match        *://javhd.com/*
// @match        *://*.javhd.com/*
// @match        *://sextb.com/*
// @match        *://*.sextb.com/*
// @match        *://pornhoarder.tv/*
// @match        *://*.pornhoarder.tv/*
// @grant        GM_xmlhttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function sendDomainToResolver(domain) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://127.0.0.1:3000/resolve/" + domain,
            onload: function(response) {
            }
        });
    }

    function extractDomainsFromHTML(html) {
        var regex = /(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi;
        var matches = html.match(regex);
        var domains = new Set();
        if (matches) {
            matches.forEach(function(url) {
                var domain = extractDomain(url);
                domains.add(domain);
            });
        }
        return Array.from(domains);
    }

    function extractDomain(url) {
        var domain;
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        } else {
            domain = url.split('/')[0];
        }
        domain = domain.split(':')[0];
        return domain;
    }

    function isDomainOnCooldown(domain) {
        var currentTime = new Date().getTime();
        return GM.getValue(domain).then(lastSentTimestamp => {
            if (lastSentTimestamp) {
                var timeDifference = currentTime - parseInt(lastSentTimestamp);
                return timeDifference < 600000;
            }
            return false;
        });
    }

    function updateStoredTimestamp(domain) {
        var currentTime = new Date().getTime().toString();
        GM.setValue(domain, currentTime);
    }

    function sendDomainIfNotOnCooldown(domain) {
        isDomainOnCooldown(domain).then(onCooldown => {
            if (!onCooldown) {
                sendDomainToResolver(domain);
                updateStoredTimestamp(domain);
            }
        });
    }

    var pageHTML = document.documentElement.outerHTML;
    var domains = extractDomainsFromHTML(pageHTML);
    domains.forEach(sendDomainIfNotOnCooldown);

    function clearLog() {
        GM.listValues().then(keys => {
            keys.forEach(key => {
                GM.deleteValue(key);
            });
            console.log("Log cleared successfully.");
        });
    }

    GM.registerMenuCommand("Clear Log", clearLog);

})();
