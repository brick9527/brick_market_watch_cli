# brick_market_watch_cli

## 安装

clone仓库

```sh
git clone git@github.com:brick9527/brick_market_watch_cli.git
```

安装依赖

```sh
cd brick_market_watch_cli

npm i
```

## 补充配置文件

### config.json

```sh
cp config.sample.json config.json
```

`config.json`配置描述：

- apiKey: binance的apikey
- apiSecret: binance的apiSecret
- proxy: 本地代理相关配置
- check_net: 检查网络配置，*可以不做修改*
- symbols: 要盯盘的币对

### notice.json

```sh
cp notice.sample.json notice.json
```

`notice.json`配置描述

- warning_target: 
  - warning_target.${item}.enable: 是否开启该指标检查
  - warning_target.${item}.price: 价格阈值
  - warning_target.${item}.name: 指标名称（暂未使用）
  - warning_target.${item}.desc: 指标描述（暂未使用）

## 运行命令

### 检查网络

```sh
npm run checknet
```

### 盯盘（单次）

**warning：现目前工具暂未开发定时盯盘，自行调用需要掌握频率**

```sh
npm run watch
```