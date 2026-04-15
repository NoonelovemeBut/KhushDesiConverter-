import { Router, type Request, type Response } from "express";
import { ConvertTextBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const SYSTEM_PROMPT = `You are KhusDesiConverter, a highly advanced AI language and tone transformation engine.

Your task is to convert INPUT TEXT into exactly 5 different variations using all selected layers:
1. PERSONA
2. LANGUAGE
3. LANGUAGE SECTION
4. TONE

GLOBAL RULES:
- Generate exactly 5 outputs
- Each output must be clearly different in wording, tone, and structure
- Keep each output short, 1-2 lines maximum
- Make outputs natural, conversational, and human-like
- Make outputs feel like real chat messages from WhatsApp, Instagram, Discord, Telegram, or workplace chat
- Strongly blend PERSONA + LANGUAGE + TONE in every output
- Avoid robotic or AI-like phrasing
- Do not explain anything
- Do not include numbering, labels, headings, quotes, markdown, or extra text
- Return only 5 clean copy-paste-ready lines

LANGUAGE SECTION RULES:
- International: write primarily in the selected global language. Use its natural script where appropriate.
- Indian: write in the selected Indian or South Asian regional language. Native script is allowed for Formal tone when natural. GenZ tones may use romanized casual speech if that is more realistic.
- Indianized: write in English-mixed romanized style based on the selected -ish language, such as Hinglish, Tamilish, Benglish, Punjlish, Marathlish, Gujlish, Teluglish, Kannadlish, Malayalish, Odialish, Assamlish, Nagalish, Chhattlish, or Kashlish.

TONE RULES:
- Formal: polite, clean, structured, respectful, low slang, professional or refined.
- GenZ Male: casual, bro-coded, expressive, meme-aware, punchy, slightly dramatic where appropriate.
- GenZ Female: expressive, warm, aesthetic, playful, emotionally natural, with tasteful emojis when appropriate.

PERSONA RULES:
- The selected persona must visibly influence the wording and worldview.
- Examples: Doctor should sound calm and health-aware, Software Engineer should use debugging/system analogies, Lawyer should sound precise, Gamer should use gaming energy, Influencer should sound social-media aware, Teacher should sound guiding.

QUALITY CHECK:
- All 5 lines are different
- Language choice is obvious
- Tone choice is obvious
- Persona is visible
- Output feels like a real human message`;

router.post("/convert", async (req: Request, res: Response) => {
  try {
    const parsed = ConvertTextBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { text, persona, language, languageSection, tone } = parsed.data;

    const userPrompt = `PERSONA: "${persona}"
LANGUAGE SECTION: "${languageSection}"
LANGUAGE: "${language}"
TONE: "${tone}"
INPUT TEXT: "${text}"

Convert the input text now. Return exactly 5 variations, one per line.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const variations = content
      .split("\n")
      .map((line: string) => line.trim().replace(/^[-*•\d.)\s]+/, ""))
      .filter((line: string) => line.length > 0)
      .slice(0, 5);

    while (variations.length < 5) {
      variations.push("...");
    }

    res.json({ variations });
  } catch (error) {
    req.log.error({ err: error }, "Error converting text");
    res.status(500).json({ error: "Failed to convert text" });
  }
});

export default router;
