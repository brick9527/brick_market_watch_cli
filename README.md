# brick_market_watch_cli

<!-- TOC -->

## 一、安装

clone仓库

```sh
git clone git@github.com:brick9527/brick_market_watch_cli.git
```

安装依赖

```sh
cd brick_market_watch_cli

npm i
```

## 二、补充配置文件

### 2.1 config.json

```sh
cp config.sample.json config.json
```

`config.json`配置描述：

- apiKey: binance的apikey
- apiSecret: binance的apiSecret
- proxy: 本地代理相关配置
  - protocol: 本地代理协议，如`http`
  - host: 本地代理主机地址，如`127.0.0.1`
  - port: 本地代理端口，如`7897`
- check_net: 检查网络配置，*可以不做修改*
  - urls: （Array<Object>）检查网络的url列表
    - url: 要检查的url，如`https://ifconfig.me`
    - method: 检查方法，如`get`
- symbols: 要盯盘的币对列表，如`["BTCUSDT"]`     
- dingtalk
  - prod: 生产环境配置
    - webhook: 钉钉机器人的webhook
    - secret: 钉钉机器人的secret
  - monitor: 监控环境配置（非必须）
    - webhook: 钉钉机器人的webhook
    - secret: 钉钉机器人的secret

### 2.2 notice.json

```sh
cp notice.sample.json notice.json
```

`notice.json`配置描述

- expire: warning信息禁止重复通知的时间（单位：分钟），默认`60`
- warning_target: 告警信号监听
  - symbol: 要检测的币对名称，如`BTCUSDT`
    - warning_target.${symbol}.enable: 是否开启该指标检查
    - warning_target.${symbol}.price: 价格阈值
    - warning_target.${symbol}.name: 指标名称（暂未使用）
    - warning_target.${symbol}.desc: 指标描述（暂未使用）
- info_target: 其他信息监听（如：出售信号）
  - symbol: 要检测的币对名称，如`BTCUSDT`
    - info_target.${symbol}.enable: 是否开启该指标检查
    - info_target.${symbol}.price: 价格阈值
    - info_target.${symbol}.name: 指标名称（暂未使用）
    - info_target.${symbol}.desc: 指标描述（暂未使用）

### 2.3 schedule.json

```sh
cp schedule.sample.json schedule.json
```

`schedule.json`配置描述

- interval: 盯盘轮询周期（`Cron`格式）
- check_net_interval: 自动巡检网络状态周期（`Cron`格式）
- count_status_interval: 自动统计网络状态周期（`Cron`格式）
- count_status_timerange: 状态统计完成后发送钉钉消息的时间段。如`[9, 21]`为每日9点后，至21:59前

## 三、运行命令

### 3.1 查看帮助

```sh
bmwc --help
```

### 3.2 盯盘（单次）

**warning：现目前工具暂未开发定时盯盘，自行调用需要掌握频率**

```sh
bmwc getprice
```

### 3.3 查看网络状态

```sh
bmwc checknet
```

### 3.4 获取账户信息

```sh
bmwc getaccount
```

### 3.5 获取通知信息

```sh
bmwc getnoticetarget
```

### 3.6 设置通知目标

```sh
bmwc setnoticetarget -f notice.json
```

### 3.7 获取版本信息

```sh
bmwc version
```



## 四、milestone

- [x] 1.0.0
  - [x] 代理支持
  - [x] 检查网络情况
  - [x] 检查交易所连接状态
  - [x] 盯盘（单次）
  - [x] 盯盘（定时）
  - [x] 钉钉通知
  - [x] docker部署
- [x] 1.1.0
  - [x] 项目启动检查各项状态
  - [x] 定期状态巡检+通知
  - [x] 优化命令行相关代码结构
  - [x] 增加配置文件说明
  - [x] 增加日志功能
- [x] 1.2.0
  - [x] 修复没有配置代理时报错问题
  - [x] 修复网络异常时服务宕机问题
- [x] 1.3.0
  - [x] 优化盯盘消息推送，减少重复消息推送
  - [ ] ~~引入SQLite~~
  - [ ] ~~使用Redis缓存数据~~
  - [x] 添加进程变量
  - [x] 添加未知错误钉钉推送
- [ ] 1.4.0
  - [ ] ~~添加websocket支持~~
  - [x] 添加ESLint
  - [x] 添加命令行相关功能
  - [x] 添加获取notice目标功能
  - [ ] ~~添加获取JSON格式的notice目标功能~~
  - [x] 添加设置notice目标功能
  - [x] 更新README.md文件说明
- [ ] 2.0.0
  - [x] 更换cli命令行工具
  - [x] 修复镜像中无法使用bwc命令的问题
  - [ ] 添加k线数据获取功能
  - [ ] 添加获取JSON格式的notice目标功能