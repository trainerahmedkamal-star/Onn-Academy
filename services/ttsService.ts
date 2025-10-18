export async function getSpeechAudioBuffer(text: string, audioContext: AudioContext): Promise<AudioBuffer | null> {
  try {
    // رابط صوت Google Translate (مجاني ومباشر)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

    // نجيب الملف الصوتي بصيغة MP3
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    // نحوله لصوت قابل للتشغيل
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return audioBuffer;
  } catch (error) {
    console.error("Error generating audio from Google Translate:", error);
    return null;
  }
}
