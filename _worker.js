/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/**
 * 查询SRV记录并返回端口号字符串
 * @param {string} zoneId - Cloudflare区域ID
 * @param {string} recordName - SRV记录名称
 * @param {string} apiToken - Cloudflare API Token
 * @returns {Promise<string>} 端口号字符串
 */
async function getSRVRecordPort(zoneId, recordName, apiToken) {
  const apiUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=SRV&name=${encodeURIComponent(recordName)}`;
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Not Found'); // 统一错误消息
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error('Not Found');
  }

  // 检查是否有SRV记录
  if (!data.result || data.result.length === 0) {
    throw new Error('Not Found');
  }

  // 获取第一个SRV记录的端口号
  const srvRecord = data.result[0];
  if (!srvRecord.data || typeof srvRecord.data.port === 'undefined') {
    throw new Error('Not Found');
  }

  // 返回端口号字符串
  return srvRecord.data.port.toString();
}

async function resolveSrv(domain) {
    console.log('resolveSrv');
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=SRV`);
    const data = await response.json();
    console.log(data.Answer);
    return data.Answer;
}

async function getDomainAndPort(domain,strdomain) {
    const srvResult = await resolveSrv(domain);
    if (srvResult && srvResult.length > 0) {
        const firstSrvRecord = srvResult[0].data;
        const parts = firstSrvRecord.split(' '); // SRV 记录中不同部分用空格分隔
        const port = parts[2]; // 第三个部分是端口号
        const target = parts[3].substring(0,parts[3].length - 1); // 第四个部分是目标域名
        return `${strdomain}:${port}`;
    } else {
        throw new Error('未找到 SRV 记录');
    }
}


function getQueryParam(param , url) {
    const iindex = url.lastIndexOf('/');
    if(iindex < 7 )
        return null;  
  const value = url.substring(iindex + 1);
    if(value != "")
        return value;
  return null;
}


export default {
  async fetch(request, env, ctx) {
    console.log('log');
    var target = "w1.hjun.tk";

    const wValue = getQueryParam('w' , request.url);
      
    if(wValue != null){
        target = wValue + ".hjun.tk";
    }
    // 获取SRV记录端口号
    const port = await getSRVRecordPort("56b1a25d6bb2732d9386fc240ca3e5da", "_www._tcp.web.hjun.tk" , "hfAlDzEDOcffS7EThxfukHXtXgs3i-zXEHmiDvL3");
    const location = `http://${target}:${port}`;
    return Response.redirect(location, 302);
  },
};

