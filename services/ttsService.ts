// src/services/ttsService.ts
export async function getSpeechAudioBuffer(text: string, audioContext: AudioContext): Promise<AudioBuffer | null> {
  try {
    // رابط Google Translate TTS — صوت إنجليزي ثابت وبشري تقريبًا
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

    // نجيب الملف الصوتي بصيغة MP3
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Google TTS fetch failed:", response.status, await response.text());
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();

    // نحوله لصيغة AudioBuffer باستخدام AudioContext (الموجود في الكود الحالي)
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error("Error generating audio from Google Translate TTS:", error);
    return null;
  }
}
