const net = require('net');

function checkProxy(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    if (port < 1 || port > 65535) {
      return resolve({ success: false, message: '端口必须在 1-65535 之间' });
    }

    // 创建 TCP 连接
    const socket = new net.Socket();
    let isTimeout = false;

    // 超时处理
    const timeoutTimer = setTimeout(() => {
      isTimeout = true;
      socket.destroy();
      resolve({
        success: false,
        message: `连接超时（超时时间：${timeout}ms）`
      });
    }, timeout);

    // 连接成功
    socket.on('connect', () => {
      clearTimeout(timeoutTimer);
      socket.destroy(); // 连接成功后立即关闭
      resolve({
        success: true,
        message: `TCP 端口 ${host}:${port} 连通成功`
      });
    });

    // 连接失败
    socket.on('error', (error) => {
      clearTimeout(timeoutTimer);
      let errorMsg = `TCP 端口 ${host}:${port} 连通失败：`;
      if (error.code === 'ECONNREFUSED') {
        errorMsg += '端口未开放或服务未启动';
      } else if (error.code === 'ENOTFOUND') {
        errorMsg += '域名解析失败';
      } else {
        errorMsg += error.message;
      }
      resolve({ success: false, message: errorMsg });
    });

    // 发起连接
    socket.connect(port, host);
  });
}

module.exports = checkProxy;