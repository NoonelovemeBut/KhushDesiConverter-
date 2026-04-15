import { Router, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
const formats = ["mp3", "wav"] as const;

type Voice = (typeof voices)[number];
type AudioFormat = (typeof formats)[number];

const languageHints: Record<string, string> = {
  English: "English, natural Indian-friendly pronunciation when appropriate",
  Hindi: "Hindi with natural Indian pronunciation",
  Hinglish: "Hinglish with natural Indian conversational pronunciation",
  Tamil: "Tamil with natural Tamil pronunciation",
  Tamilish: "Tamilish with natural Tamil-English mixed pronunciation",
  Telugu: "Telugu with natural Telugu pronunciation",
  Teluglish: "Teluglish with natural Telugu-English mixed pronunciation",
  Bengali: "Bengali with natural Bengali pronunciation",
  Benglish: "Benglish with natural Bengali-English mixed pronunciation",
  Marathi: "Marathi with natural Marathi pronunciation",
  Marathlish: "Marathlish with natural Marathi-English mixed pronunciation",
  Gujarati: "Gujarati with natural Gujarati pronunciation",
  Gujlish: "Gujlish with natural Gujarati-English mixed pronunciation",
  Punjabi: "Punjabi with natural Punjabi pronunciation",
  Punjablish: "Punjlish with natural Punjabi-English mixed pronunciation",
  Kannada: "Kannada with natural Kannada pronunciation",
  Kannadlish: "Kannadlish with natural Kannada-English mixed pronunciation",
  Malayalam: "Malayalam with natural Malayalam pronunciation",
  Malayalish: "Malayalish with natural Malayalam-English mixed pronunciation",
  Odia: "Odia with natural Odia pronunciation",
  Odialish: "Odialish with natural Odia-English mixed pronunciation",
  Assamese: "Assamese with natural Assamese pronunciation",
  Assamlish: "Assamlish with natural Assamese-English mixed pronunciation",
  Urdu: "Urdu with natural pronunciation",
};

router.post("/tts", async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    if (typeof body.text !== "string" || body.text.trim().length === 0 || body.text.length > 2000 || typeof body.language !== "string" || body.language.trim().length === 0) {
      res.status(400).json({ error: "Invalid audio request" });
      return;
    }

    const text = body.text.trim();
    const language = body.language.trim();
    const tone = typeof body.tone === "string" ? body.tone : undefined;
    const persona = typeof body.persona === "string" ? body.persona : undefined;
    const voice: Voice = typeof body.voice === "string" && voices.includes(body.voice as Voice) ? body.voice as Voice : "nova";
    const format: AudioFormat = typeof body.format === "string" && formats.includes(body.format as AudioFormat) ? body.format as AudioFormat : "mp3";
    const hint = languageHints[language] ?? `${language}, with natural pronunciation if supported`;

    const response = await openai.chat.completions.create({
      model: "gpt-audio",
      modalities: ["text", "audio"],
      audio: { voice, format },
      messages: [
        {
          role: "system",
          content: `You are a high-quality text-to-speech engine. Speak the user's text verbatim. Use ${hint}. Preserve the selected emotional style when natural. Do not add, remove, translate, summarize, or explain any words.`,
        },
        {
          role: "user",
          content: `Language: ${language}\nTone: ${tone ?? "Natural"}\nPersona: ${persona ?? "Natural"}\nText to speak verbatim:\n${text}`,
        },
      ],
    });

    const audioData = (response.choices[0]?.message as any)?.audio?.data ?? "";
    if (!audioData) {
      res.status(500).json({ error: "No audio generated" });
      return;
    }

    const buffer = Buffer.from(audioData, "base64");
    res.setHeader("Content-Type", format === "mp3" ? "audio/mpeg" : "audio/wav");
    res.setHeader("Content-Disposition", `inline; filename=khus-desi-audio.${format}`);
    res.send(buffer);
  } catch (error) {
    req.log.error({ err: error }, "Error generating text-to-speech audio");
    res.status(500).json({ error: "Failed to generate audio" });
  }
});

export default router;
