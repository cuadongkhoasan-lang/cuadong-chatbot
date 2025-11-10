// netlify/functions/gemini.js
// Runtime Node 18+ có sẵn fetch => không cần "node-fetch"

exports.handler = async (event) => {
  try {
    const { prompt = "" } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GOOGLE_API_KEY; // set ở Bước 4
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      apiKey;

    const aiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await aiRes.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI không trả lời.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Lỗi kết nối AI." }),
    };
  }
};
