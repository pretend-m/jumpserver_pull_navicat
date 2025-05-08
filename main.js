// ==UserScript==
// @name         jumpserver自动拉起Navicat
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  拦截请求并通过 navicat:// 协议直接拉起 Navicat，并自动复制密码到剪切板。
// @author       pretendm
// @match        https://xxxx.com/luna/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // 保存端口和host信息
    let smartEndpointInfo = {
        host: window.location.hostname,
        mysql_port: 33061,
        postgresql_port: 54320,
        sqlserver_port: 14330,
    };

    // 缓存待拉起的数据
    let pendingNavicatData = null;

    // 阻止离开弹窗
    const rawAdd = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'beforeunload') return;
        return rawAdd.call(this, type, listener, options);
    };

    // 拦截 XMLHttpRequest 请求
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        // 1. 拦截 connection-token 接口，缓存拉起请求
        if (url.includes('/api/v1/authentication/connection-token/')) {
            this.addEventListener('load', function () {
                try {
                    const data = JSON.parse(this.responseText);
                    if (data.connect_method === 'db_guide') {
                        // 缓存数据
                        pendingNavicatData = data;
                        // 如果端口信息已经到位，直接拉起
                        if (smartEndpointInfo._ready) {
                            launchNavicatIfPending();
                        }
                    }
                } catch (error) {
                    console.error('解析 JSON 数据失败:', error);
                }
            });
        }

        // 2. 拦截 smart endpoint 接口，保存端口和host
        if (url.includes('/api/v1/terminal/endpoints/smart/')) {
            this.addEventListener('load', function () {
                try {
                    const data = JSON.parse(this.responseText);
                    smartEndpointInfo.host = data.host || smartEndpointInfo.host;
                    smartEndpointInfo.mysql_port = data.mysql_port || smartEndpointInfo.mysql_port;
                    smartEndpointInfo.postgresql_port = data.postgresql_port || smartEndpointInfo.postgresql_port;
                    smartEndpointInfo.sqlserver_port = data.sqlserver_port || smartEndpointInfo.sqlserver_port;
                    // 标记端口信息已准备好
                    smartEndpointInfo._ready = true; 
                    // 有未处理的拉起请求
                    launchNavicatIfPending();
                } catch (e) {}
            });
        }

        return originalOpen.call(this, method, url, ...rest);
    };

    // 检查并拉起Navicat
    function launchNavicatIfPending() {
        if (pendingNavicatData && smartEndpointInfo._ready) {
            const navicatUrl = generateNavicatUrl(pendingNavicatData);
            openNavicat(navicatUrl);
            copyPasswordToClipboard(pendingNavicatData.value);
            // 清空缓存
            pendingNavicatData = null; 
        }
    }

    // 生成 Navicat URI 的函数
    function generateNavicatUrl(data) {
        let protocol = data.protocol;
        // 默认mysql
        let port = smartEndpointInfo.mysql_port; 

        if (data.protocol === 'postgresql') {
            protocol = 'pgsql';
            port = smartEndpointInfo.postgresql_port;
        }
        if (data.protocol === 'sqlserver') {
            protocol = 'mssql';
            port = smartEndpointInfo.sqlserver_port;
        }

        const username = data.id;
        const name = data.asset_display.replace(/\([^)]*\)/g, '').trim();
        const host = smartEndpointInfo.host;
        return `navicat://conn.${protocol}?Conn.Host=${host}&Conn.Port=${port}&Conn.Username=${username}&Conn.Name=${name}`;
    }

    function openNavicat(navicatUrl) {
        window.location.href = navicatUrl;
    }

    function copyPasswordToClipboard(password) {
        navigator.clipboard.writeText(password).then(() => {
        }).catch(err => {
            alert('复制密码到剪切板失败，请手动复制。');
        });
    }
})();
