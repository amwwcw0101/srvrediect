/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


async function resolveSrv(domain) {
    console.log('resolveSrv');
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=SRV`);
    const data = await response.json();
    console.log(data.Answer);
    return data.Answer;
}

async function getDomainAndPort(domain) {
    const srvResult = await resolveSrv(domain);
    if (srvResult && srvResult.length > 0) {
        const firstSrvRecord = srvResult[0].data;
        const parts = firstSrvRecord.split(' '); // SRV 记录中不同部分用空格分隔
        const port = parts[2]; // 第三个部分是端口号
        const target = parts[3].substring(0,parts[3].length - 1); // 第四个部分是目标域名
        return `sf4.hjun.tk:${port}`;
    } else {
        throw new Error('未找到 SRV 记录');
    }
}





export default {
  async fetch(request, env, ctx) {
    console.log('log');
    var r = "";
    const result = await getDomainAndPort('_www._tcp.www.xjjun.dynv6.net');
    console.log('域名和端口号:', result);
    const location = `http://${result}`;
    return Response.redirect(location, 302);
  },
};

