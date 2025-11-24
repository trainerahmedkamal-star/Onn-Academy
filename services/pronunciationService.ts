
export interface PronunciationAssessment {
  score: number; // A score from 0 to 1
  message: string;
}

// Helper to calculate Levenshtein distance (similarity between two strings)
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const calculateSimilarity = (target: string, input: string): number => {
    const longer = target.length > input.length ? target : input;
    if (longer.length === 0) {
      return 1.0;
    }
    const distance = levenshteinDistance(target.toLowerCase(), input.toLowerCase());
    return (longer.length - distance) / longer.length;
};

// --- Hugging Face Whisper Integration ---

const recordAudio = (durationMs: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks: BlobPart[] = [];

                mediaRecorder.addEventListener("dataavailable", (event) => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' }); // wav is safer for APIs
                    resolve(audioBlob);
                    // Stop all tracks to release mic
                    stream.getTracks().forEach(track => track.stop());
                });

                mediaRecorder.start();

                setTimeout(() => {
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                }, durationMs);
            })
            .catch(err => reject(err));
    });
};

const transcribeWithWhisper = async (audioBlob: Blob, token: string): Promise<string> => {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-base",
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/octet-stream",
            },
            method: "POST",
            body: audioBlob,
        }
    );

    if (!response.ok) {
        throw new Error(`HF API Error: ${response.statusText}`);
    }

    const result = await response.json();
    // Whisper usually returns { text: "transcription..." }
    return result.text || "";
};

// --- Fallback: Web Speech API ---

const recognizeWithWebSpeech = (lang: string = 'en-US'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            reject("Browser does not support Speech Recognition");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            resolve(event.results[0][0].transcript);
        };

        recognition.onerror = (event: any) => {
            reject(event.error);
        };

        recognition.onend = () => {
           // If it ends without result, we might handle it outside
        };

        try {
            recognition.start();
        } catch (e) {
            reject(e);
        }
    });
};


/**
 * Evaluates speech using Hugging Face Whisper (if token present) or Web Speech API (fallback).
 */
export const evaluateSpeech = async (targetText: string): Promise<PronunciationAssessment> => {
    const hfToken = process.env.HUGGING_FACE_TOKEN;
    
    let transcript = "";
    let methodUsed = "";

    try {
        if (hfToken) {
            // Use Whisper
            console.log("Using Whisper (Hugging Face)...");
            methodUsed = "Whisper AI";
            // Record for 3 seconds (good enough for single words/short phrases)
            const audioBlob = await recordAudio(3000);
            transcript = await transcribeWithWhisper(audioBlob, hfToken);
        } else {
            // Use Web Speech API Fallback
            console.log("Using Web Speech API (Fallback)...");
            methodUsed = "Browser Speech";
            transcript = await recognizeWithWebSpeech();
        }
    } catch (error) {
        console.warn("Primary speech recognition failed, trying fallback or exiting.", error);
        
        // If Whisper failed (e.g., API limit), try Web Speech API immediately as backup
        if (methodUsed === "Whisper AI") {
            try {
                transcript = await recognizeWithWebSpeech();
            } catch (e) {
                return { score: 0, message: "تعذر الوصول للميكروفون أو الخدمة." };
            }
        } else {
            return { score: 0, message: "حدث خطأ في التعرف على الصوت." };
        }
    }

    console.log("User said:", transcript);

    // Clean up text for comparison (remove punctuation)
    const cleanTarget = targetText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanTranscript = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    const similarity = calculateSimilarity(cleanTarget, cleanTranscript);
    
    // Generate feedback based on similarity score
    let message = "";
    if (similarity >= 0.9) { // High threshold for Whisper
            message = "ممتاز! نطق سليم 100% 🌟";
    } else if (similarity > 0.7) {
            message = `رائع! لقد قلت "${cleanTranscript}" وهي قريبة جداً.`;
    } else if (similarity > 0.4) {
            message = `جيد، لكنك قلت "${cleanTranscript}". حاول مرة أخرى!`;
    } else {
            message = `سمعت "${cleanTranscript}". حاول بوضوح أكثر.`;
    }

    return {
        score: similarity,
        message: message
    };
};
