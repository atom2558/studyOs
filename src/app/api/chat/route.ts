import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Use the 9arm API provided by the user
    const apiKey = "sk-DvdsqHV_M5uxfQm3wWPWNA";
    const apiUrl = "https://gateway.9arm.co/v1/chat/completions";

    // Add system prompt to give the AI context
    const systemPrompt = {
      role: "system",
      content: "คุณคือ AI Tutor ส่วนตัวสำหรับแอป studyOs คุณมีหน้าที่ช่วยนักเรียนในการวางแผนการเรียน อธิบายเนื้อหาที่ยากให้เข้าใจง่าย และเป็นโค้ชให้กำลังใจ ตอบคำถามอย่างเป็นมิตร สุภาพ และให้ข้อมูลที่เป็นประโยชน์สูงสุดเสมอ ใช้ภาษาไทยเป็นหลัก"
    };

    const apiMessages = [systemPrompt, ...messages];

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "qwen3.6-35b-a3b",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return NextResponse.json({ error: "Failed to connect to AI server." }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Chat API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
