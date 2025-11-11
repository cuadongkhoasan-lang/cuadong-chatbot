// netlify/functions/gemini.js
// Runtime Node 18+ có sẵn fetch => không cần "node-fetch"

exports.handler = async (event) => {
    try {
        const { prompt = "" } = JSON.parse(event.body || "{}");

        // 1. Kiểm tra API Key
        const apiKey = process.env.GEMINI_API_KEY; 
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in environment variables.");
        }

        const url =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
            apiKey;

        const aiRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Sửa lỗi 1: Thêm 'role' vào contents
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            }),
        });

        // Sửa lỗi 2: Xử lý lỗi API Response
        if (!aiRes.ok) {
            // Log lỗi chi tiết từ API để dễ debug trên Netlify Logs
            const errorText = await aiRes.text();
            console.error(`Gemini API returned status ${aiRes.status}: ${errorText}`);
            throw new Error("API call failed."); // Ném ra lỗi chung để catch
        }

        const data = await aiRes.json();

        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "AI không trả lời hoặc phản hồi không đúng định dạng.";

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        };
    } catch (e) {
        // Log lỗi cụ thể (ví dụ: API Key thiếu, lỗi mạng, lỗi API)
        console.error("Chatbot Function Error:", e.message); 
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            // Trả về lỗi chung cho người dùng
            body: JSON.stringify({ text: "Lỗi kết nối AI. Vui lòng kiểm tra Netlify Logs." }), 
        };
    }
};
