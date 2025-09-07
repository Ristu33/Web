export async function onRequest(context) {
  const { request, env } = context;

  // 處理 CORS 預檢
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("僅接受 POST 請求", { status: 405 });
  }

  try {
    const { email, message } = await request.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "訊息不能為空" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const userIP = request.headers.get("cf-connecting-ip") || "Unknown";

    // 發送到 Discord
    await fetch(env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "📩 新的聯繫表單訊息",
            fields: [
              { name: "Email", value: email || "未提供" },
              { name: "訊息", value: message },
              { name: "來源 IP", value: userIP },
            ],
            color: 0x5865f2,
          },
        ],
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "傳送失敗" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
