/**
 * @file check_net.js
 * 检查使用对应代理之后，对应的代理的ip地址以及所属信息
 * （规避币安的地域限制）
 */
const axios = require('axios');
const IPDB = require('ipdb');
const qqwryIPDB = require('qqwry.ipdb');

const config = require('../../../config.json');

/**
 * 检查网络
 * @param {any} arg - 命令行参数
 * @param {Object} flags - 命令行flags
 * @param {Array<String>} urls - 检查的url列表
 * @param {Object} proxy - 代理配置
 */
async function checkNet() {

    const ipdb = new IPDB(qqwryIPDB);

    const IPInfoList = [];
    const urls = config.check_net.urls || [];
    const proxy = config.proxy;

    for (let i = 0; i < urls.length; i++) {

        const urlConfig = urls[i];

        const ip = await checkSingleNet(urlConfig, proxy);
        const ipInfo = ipdb.find(ip);
        IPInfoList.push({ ip, ...ipInfo.data });
    }

    console.log(IPInfoList);
}


async function checkSingleNet(urlConfig, proxyConfig) {
    const result = await axios({
        method: urlConfig.method,
        url: urlConfig.url,
        proxy: {
            protocol: proxyConfig.protocol,
            host: proxyConfig.host,
            port: proxyConfig.port,
        },
    });

    return result.data;
}

module.exports = checkNet;