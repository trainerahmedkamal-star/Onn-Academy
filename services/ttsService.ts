export async function getSpeechAudioBuffer(text: string, audioContext: AudioContext): Promise<AudioBuffer | null> {
  try {
    // نطلب الصوت من Coqui API
    const response = await fetch("https://app.coqui.ai/api/v2/speak", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_COQUI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text, // النص اللي هيتحول لصوت
        voice: "coqui-tts/en_us/ryan", // صوت افتراضي (تقدر تغيّره لاحقًا)
      }),
    });

    if (!response.ok) {
      console.error("Coqui API Error:", await response.text());
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
