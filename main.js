// ==UserScript==
// @name         jumpserver自动拉起Navicat(macOS)
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  拦截请求并通过 navicat:// 协议直接拉起 Navicat (macOS)，并自动复制密码到剪切板。
// @author       pretendm
// @match        https://xxxx.com/luna/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // 拦截 XMLHttpRequest 请求
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (url.includes('/api/v1/authentication/connection-token/')) {
            this.addEventListener('load', function () {
                try {
                    // 解析返回的 JSON 数据
                    const data = JSON.parse(this.responseText);
                    console.log(data);

                    // 生成 Navicat URI
                    const navicatUrl = generateNavicatUrl(data);

                    // 拉起 Navicat
                    openNavicat(navicatUrl);

                    // 自动复制密码到剪切板
                    copyPasswordToClipboard(data.value);
                } catch (error) {
                    console.error('解析 JSON 数据失败:', error);
                }
            });
        }
        return originalOpen.call(this, method, url, ...rest);
    };

    // 生成 Navicat URI 的函数
    function generateNavicatUrl(data) {
        // 默认为mysql配置
        // 自定义端口号
        let port = 33061;
        // 提取数据库类型
        let protocol = data.protocol;
        // 处理postgresql
        if (data.protocol == 'postgresql'){
            protocol = 'pgsql'
            // 自定义端口号
            port = 54320
        }
        // 处理sqlserver
        if (data.protocol == 'sqlserver'){
            protocol = 'mssql'
            // 自定义端口号
            port = 14330
        }
        // 提取账户
        const username = data.id;
        // 提取密码
        const password = data.value;
        // 自定义主机地址
        const host = "xxxx.com";
        // 提取连接名
        const name = data.asset_display;

        // 返回Navicat的URI
        return `navicat://conn.${protocol}?Conn.Host=${host}&Conn.Port=${port}&Conn.Username=${username}&Conn.Name=${name}`;
    }

    // 打开 Navicat 的函数
    function openNavicat(navicatUri) {
        console.log('尝试拉起 Navicat URI:', navicatUri);
        window.location.href = navicatUri;
    }

    // 自动复制密码到剪切板的函数
    function copyPasswordToClipboard(password) {
        navigator.clipboard.writeText(password).then(() => {
            console.log('密码已成功复制到剪切板:', password);
        }).catch(err => {
            console.error('复制密码到剪切板失败:', err);
            alert('复制密码到剪切板失败，请手动复制。');
        });
    }
})();
