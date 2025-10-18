export async function getSpeechAudioBuffer(text: string, audioContext: AudioContext): Promise<AudioBuffer | null> {
  try {
    // نطلب الصوت من Coqui TTS (رابط جديد فعّال)
    const response = await fetch("https://app.coqui.ai/api/v2/tts/speak", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_COQUI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text, // النص الذي سيتم تحويله لصوت
        voice_id: "4f1dff3b-9f9c-4d9d-9bfb-079d2b3cfb6a", // صوت افتراضي (تقدر تغيّره لاحقًا)
        output_format: "mp3", // نطلب ملف بصيغة mp3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coqui API Error:", errorText);
      throw new Error("Audio generation failed");
    }

    // نحصل على الملف الصوتي كـ ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // نستخدم Web Audio API لتحويله لصوت قابل للتشغيل
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return audioBuffer;

  } catch (error) {
    console.error("Error generating audio from Coqui:", error);
    return null;
  }
}
