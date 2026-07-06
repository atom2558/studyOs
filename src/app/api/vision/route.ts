import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = "sk-DvdsqHV_M5uxfQm3wWPWNA";
    const apiUrl = "https://gateway.9arm.co/v1/chat/completions";

    const prompt = `วิเคราะห์รูปภาพนี้ และสกัด 'งาน', 'การบ้าน', 'สิ่งที่ต้องทำ' หรือ 'ตารางเรียน' ออกมาเป็นรายการ To-Do list
ตอบกลับมาในรูปแบบ JSON array เท่านั้น ห้ามมีข้อความอื่นปนเด็ดขาด โดยโครงสร้าง JSON ต้องเป็นดังนี้:
[
  { "title": "ชื่องานที่ 1" },
  { "title": "ชื่องานที่ 2" }
]`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "qwen3.6-35b-a3b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.1, // Low temperature for more deterministic JSON output
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vision API Error:", errorText);
      return NextResponse.json({ error: "Failed to connect to AI Vision server." }, { status: 500 });
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || "[]";
    
    // Clean up potential markdown code block formatting (e.g. ```json ... ```)
    aiResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    let tasks = [];
    try {
      tasks = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", aiResponse);
      return NextResponse.json({ error: "AI response was not valid JSON", raw: aiResponse }, { status: 500 });
    }

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error("Vision API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
