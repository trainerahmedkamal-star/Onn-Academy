export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");

    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
      });
    }

    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(googleUrl);
    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*", // مهم جدًا عشان يمنع خطأ CORS
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "TTS failed" }), {
      status: 500,
    });
  }
}

