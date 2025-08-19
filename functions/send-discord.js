export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("僅接受 POST 請求", { status: 405 });
  }

  const { message } = await request.json();
  if (!message) return new Response(JSON.stringify({error:"訊息不能為空"}), {status:400});

  const userIP = request.headers.get("cf-connecting-ip") || "Unknown";

  try {
    await fetch(env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `訊息: ${message}\nIP: ${userIP}` })
    });
    return new Response(JSON.stringify({success:true}), {status:200});
  } catch (err) {
    return new Response(JSON.stringify({error:"傳送失敗"}), {status:500});
  }
}
