import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Drama,
  Flame,
  Globe2,
  Languages,
  Loader2,
  Mail,
  MessageSquare,
  Mic,
  Pause,
  Search,
  Sparkles,
  UserRound,
  Volume2,
  Wand2,
  Wifi,
  WifiOff,
} from "lucide-react";

import { getHealthCheckQueryKey, useConvertText, useHealthCheck } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type AppTheme, useTheme } from "@/components/ThemeProvider";

import logoUrl from "@assets/Picsart_26-04-14_04-56-47-885_1776130410586.jpg";

type PersonaCategory = "Trending" | "Professional" | "Student" | "Emotional" | "Fun" | "Lifestyle" | "Science" | "Humanities" | "Spiritual" | "Philosophy" | "Foreign" | "Indian" | "Belief";

type LanguageSection = "International" | "Indian" | "Indianized";

type ConvertPayload = {
  text: string;
  persona: string;
  language: string;
  languageSection: LanguageSection;
  tone: string;
};

const PERSONA_GROUPS: { category: PersonaCategory; label: string; personas: string[] }[] = [
  { category: "Trending", label: "Trending", personas: ["Reel Creator", "Meme Lord", "Reddit User", "Discord Mod", "Twitter/X User", "Streamer (Gamer)", "Podcaster", "YouTube Commenter", "Fanboy/Fangirl", "Influencer Coach", "Influencer", "Content Creator", "TikTok Creator", "Social Media User"] },
  { category: "Professional", label: "Professional", personas: ["HR Manager", "Customer Support", "Boss/Manager", "Startup Founder", "Freelancer", "Office Employee", "Shopkeeper", "Delivery Guy", "Security Guard", "Call Center Agent", "Doctor", "Software Engineer", "Lawyer", "Teacher", "Businessman", "Salesperson", "Corporate Employee", "Engineer", "Designer"] },
  { category: "Student", label: "Student Life", personas: ["Backbencher", "Topper", "Dropper (NEET/JEE)", "Hostel Student", "School Kid", "Student", "IIT Aspirant"] },
  { category: "Emotional", label: "Emotional", personas: ["Heartbroken Person", "Overattached Partner", "Ignore Mode Person", "Jealous Friend", "Fake Nice Person", "Fake GF/BF"] },
  { category: "Fun", label: "Fun", personas: ["Roaster", "Chapri Style", "Cringe Creator", "Desi Aunty", "Relatable Indian Mom", "Goth", "Chapri", "Narcissist", "Comedian", "Lazy Person", "Gamer", "Actor", "Musician", "Photographer", "Traveler"] },
  { category: "Lifestyle", label: "Lifestyle", personas: ["Gym Trainer", "Diet Freak", "Spiritual Monk", "Crypto Trader", "Stock Market Guy", "Fitness Coach", "Chef", "Entrepreneur", "Hustler", "Motivational Speaker"] },
  { category: "Science", label: "Science", personas: ["Physicist", "Chemist", "Biologist", "Mathematician", "Data Scientist", "AI Researcher", "Engineer (Core)", "Scientist", "AI Expert"] },
  { category: "Humanities", label: "Humanities", personas: ["Historian", "Philosopher", "Psychologist", "Sociologist", "Economist", "Political Analyst", "Propagandist", "Communal", "Fundamentalist", "Akhand Bharat Unity Freak", "Lemuria/Kumari Kandam Freak", "God", "Demonic", "Thanos", "Alien", "Microorganisms", "Ghost", "Cowboy", "Animals", "Pre Earth", "Narendra Modi", "2033 Indian Final Political Revolution", "Journalist", "News Reporter", "Police Officer", "Politician"] },
  { category: "Spiritual", label: "Spiritual", personas: ["Hindu Perspective", "Muslim Perspective", "Christian Perspective", "Buddhist Perspective", "Sikh Perspective", "Jain Perspective", "Jewish Perspective", "Taoist Perspective", "Shinto Perspective", "Zoroastrian Perspective", "Astrologer"] },
  { category: "Philosophy", label: "Philosophy", personas: ["Stoic Thinker", "Existentialist", "Nihilist", "Optimist", "Realist", "Minimalist", "Spiritual Seeker"] },
  { category: "Foreign", label: "Foreign Philosophy", personas: ["Absurdist", "Pragmatist", "Rationalist", "Empiricist", "Determinist"] },
  { category: "Indian", label: "Indian Philosophy", personas: ["Vedanta Thinker", "Advaita", "Samkhya Philosopher", "Yoga Philosophy", "Nyaya Thinker", "Vaisheshika", "Mimamsa Thinker", "Charvaka", "Bhakti Philosopher", "Sufi-inspired Thinker"] },
  { category: "Belief", label: "Belief System", personas: ["Atheist", "Agnostic", "Theist", "Spiritual but Not Religious", "Skeptic"] },
];

const CATEGORY_TABS: PersonaCategory[] = ["Trending", "Professional", "Fun", "Philosophy", "Spiritual"];

const INTERNATIONAL_LANGUAGES = ["English", "Spanish", "French", "German", "Arabic", "Mandarin Chinese", "Russian", "Portuguese", "Japanese", "Korean", "Turkish", "Italian", "Dutch", "Indonesian", "Thai", "Vietnamese", "Persian (Farsi)", "Swahili", "Polish", "Ukrainian"] as const;

const INDIAN_LANGUAGE_GROUPS = [
  { region: "North India", languages: ["Hindi", "Awadhi", "Bhojpuri", "Maithili", "Magahi", "Angika", "Marwari", "Mewari", "Dhundhari", "Haryanvi", "Bagri", "Ahirwati", "Punjabi", "Kangri", "Kinnauri", "Lahauli", "Garhwali", "Kumaoni", "Jaunsari"] },
  { region: "West India", languages: ["Marathi", "Konkani", "Varhadi", "Gujarati", "Kutchi", "Kathiyawadi"] },
  { region: "South India", languages: ["Tamil", "Kannada", "Tulu", "Kodava", "Malayalam", "Telugu (Andhra + Telangana)", "Lambadi"] },
  { region: "East India", languages: ["Bengali", "Santali", "Odia", "Sambalpuri", "Ho", "Mundari", "Kurukh"] },
  { region: "North-East", languages: ["Assamese", "Bodo", "Karbi", "Nyishi", "Adi", "Apatani", "Ao", "Angami", "Sumi", "Meitei", "Mizo", "Khasi", "Garo", "Kokborok"] },
  { region: "Central", languages: ["Bundeli", "Bagheli", "Malvi", "Chhattisgarhi", "Halbi"] },
  { region: "Union Territories", languages: ["Hindi", "Urdu", "Kashmiri", "Dogri", "Ladakhi"] },
  { region: "South Asia", languages: ["Urdu", "Punjabi (Pakistan)", "Nepali", "Dzongkha", "Sinhala", "Tamil (Sri Lanka)", "Dhivehi", "Pashto", "Dari", "Burmese", "Tibetan"] },
] as const;

const INDIANIZED_LANGUAGES = ["Hinglish", "Bhojlish", "Rajlish", "Awadhlish", "Maithilish", "Punjablish", "Marathlish", "Gujlish", "Konklish", "Kutlish", "Tamilish", "Teluglish", "Kannadlish", "Malayalish", "Tululish", "Kodavlish", "Benglish", "Odialish", "Santlish", "Sambalish", "Assamlish", "Nagalish", "Meiteilish", "Mizolish", "Khaslish", "Garolish", "Chhattlish", "Bundlish", "Malvlish", "Kashlish", "Doglish", "Urduish", "Nepalish", "Tibetlish"] as const;

const TONES = ["Formal", "GenZ Male", "GenZ Female"] as const;

const THEMES: { id: AppTheme; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "🌞 Light" },
  { id: "dark", label: "🌙 Dark" },
  { id: "neon", label: "🌈 Neon" },
  { id: "glass", label: "🧊 Glass" },
  { id: "purple-ai", label: "🟣 Purple AI" },
  { id: "student", label: "🎓 Student" },
  { id: "business", label: "💼 Business" },
  { id: "space", label: "🌌 Space" },
  { id: "religious", label: "🛐 Religious" },
  { id: "peaceful", label: "🧘 Peaceful" },
  { id: "philosophy", label: "🧠 Philosophy" },
];

const SECTION_META: Record<LanguageSection, { icon: typeof Globe2; label: string; subtitle: string }> = {
  International: { icon: Globe2, label: "International", subtitle: "Top global languages" },
  Indian: { icon: Languages, label: "Indian", subtitle: "Regional + South Asian" },
  Indianized: { icon: Flame, label: "Indianized", subtitle: "English-mixed -ish styles" },
};

const DEFAULT_LANGUAGE_BY_SECTION: Record<LanguageSection, string> = {
  International: "English",
  Indian: "Hindi",
  Indianized: "Hinglish",
};

function compactTestId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function safeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "audio";
}

export default function Home() {
  const { toast } = useToast();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [persona, setPersonaState] = useState(() => localStorage.getItem("khus-desi-persona") || "Software Engineer");
  const [personaCategory, setPersonaCategory] = useState<PersonaCategory>("Trending");
  const [personaSearch, setPersonaSearch] = useState("");
  const [languageSection, setLanguageSection] = useState<LanguageSection>("International");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Formal");
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [variations, setVariations] = useState<string[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeCacheKey, setActiveCacheKey] = useState("");
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingAudioKey, setLoadingAudioKey] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [voice, setVoice] = useState<"alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer">("nova");
  const [speechRate, setSpeechRate] = useState(1);
  const latestRequestKey = useRef("");
  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: healthData, isError: isHealthError, isLoading: isHealthLoading } = useHealthCheck({
    query: { refetchInterval: 30000, queryKey: getHealthCheckQueryKey() },
  });

  const convertMutation = useConvertText();

  const selectedSummary = `${persona} • ${language} • ${tone}`;
  const cacheKey = useMemo(() => JSON.stringify({ text: debouncedText.trim(), persona, language, languageSection, tone }), [debouncedText, persona, language, languageSection, tone]);

  const visiblePersonaGroups = useMemo(() => {
    const query = personaSearch.trim().toLowerCase();
    const groups = query ? PERSONA_GROUPS : PERSONA_GROUPS.filter((group) => group.category === personaCategory);
    return groups
      .map((group) => ({ ...group, personas: group.personas.filter((item) => item.toLowerCase().includes(query)) }))
      .filter((group) => group.personas.length > 0);
  }, [personaCategory, personaSearch]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedText(text), 650);
    return () => window.clearTimeout(id);
  }, [text]);

  useEffect(() => {
    if (!debouncedText.trim() || !language || !tone || !persona) {
      setVariations(null);
      return;
    }

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setActiveCacheKey(cacheKey);
      setVariations(cached);
      return;
    }

    latestRequestKey.current = cacheKey;
    setActiveCacheKey(cacheKey);
    setVariations(null);

    convertMutation.mutate(
      { data: { text: debouncedText.trim(), persona, language, languageSection, tone } },
      {
        onSuccess: (data) => {
          if (latestRequestKey.current !== cacheKey) return;
          cacheRef.current.set(cacheKey, data.variations);
          setVariations(data.variations);
        },
        onError: () => {
          if (latestRequestKey.current !== cacheKey) return;
          toast({ title: "Conversion failed", description: "The AI could not convert this message right now.", variant: "destructive" });
        },
      },
    );
  }, [cacheKey, debouncedText, language, languageSection, persona, tone]);

  const setPersona = (value: string) => {
    localStorage.setItem("khus-desi-persona", value);
    setPersonaState(value);
  };

  const selectSection = (section: LanguageSection) => {
    setLanguageSection(section);
    setLanguage(DEFAULT_LANGUAGE_BY_SECTION[section]);
  };

  const getAudioUrl = useCallback(async (audioText: string, key: string) => {
    const cached = audioCacheRef.current.get(key);
    if (cached) return cached;

    setLoadingAudioKey(key);
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: audioText, language, tone, persona, voice, format: "mp3" }),
    });

    if (!response.ok) throw new Error("Audio generation failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audioCacheRef.current.set(key, url);
    setLoadingAudioKey(null);
    return url;
  }, [language, persona, tone, voice]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingKey(null);
  };

  const playAudio = async (audioText: string, key: string) => {
    try {
      if (playingKey === key) {
        stopAudio();
        return;
      }
      stopAudio();
      const url = await getAudioUrl(audioText, key);
      const audio = new Audio(url);
      audio.playbackRate = speechRate;
      audio.onended = () => setPlayingKey(null);
      audio.onerror = () => setPlayingKey(null);
      audioRef.current = audio;
      setPlayingKey(key);
      await audio.play();
    } catch {
      setLoadingAudioKey(null);
      setPlayingKey(null);
      toast({ title: "Audio failed", description: "Could not prepare this audio right now.", variant: "destructive" });
    }
  };

  const downloadAudio = async (audioText: string, key: string) => {
    try {
      const url = await getAudioUrl(audioText, key);
      const link = document.createElement("a");
      link.href = url;
      link.download = `khusdesi-${safeFileName(language)}-${safeFileName(tone)}-${safeFileName(key)}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setLoadingAudioKey(null);
      toast({ title: "Download failed", description: "Could not save this audio right now.", variant: "destructive" });
    }
  };

  const startSpeechInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Voice input unavailable", description: "Your browser does not support speech input here." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => setText((event.results?.[0]?.[0]?.transcript ?? text).trim());
    recognition.start();
  };

  useEffect(() => {
    if (autoSpeak && variations?.[0]) {
      void playAudio(variations[0], `auto-${activeCacheKey}`);
    }
  }, [autoSpeak, variations, activeCacheKey]);

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      toast({ title: "Copied", description: "Ready to paste anywhere." });
      window.setTimeout(() => setCopiedIndex(null), 1600);
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  const renderLanguageChip = (value: string) => (
    <button
      key={`${languageSection}-${value}`}
      type="button"
      onClick={() => setLanguage(value)}
      className={`min-w-0 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition-all duration-200 ${language === value ? "border-primary bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,0,170,0.25)]" : "border-border bg-card/80 text-foreground/80 hover:border-primary/60 hover:bg-primary/10"}`}
      data-testid={`button-language-${compactTestId(value)}`}
    >
      {value}
    </button>
  );

  const isCached = Boolean(cacheRef.current.get(activeCacheKey));
  const isConverting = convertMutation.isPending && !variations;
  const ActiveSectionIcon = SECTION_META[languageSection].icon;

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none fixed left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] max-w-[85vw] rounded-full bg-primary/15 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-[-14rem] right-[-14rem] h-[34rem] w-[34rem] max-w-[85vw] rounded-full bg-secondary/15 blur-[130px]" />
      {resolvedTheme === "space" && <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px),radial-gradient(circle_at_80%_30%,white_1px,transparent_1px),radial-gradient(circle_at_40%_70%,white_1px,transparent_1px)] [background-size:180px_180px,240px_240px,300px_300px]" />}

      <header className="sticky top-0 z-30 w-full max-w-full border-b border-border/70 bg-background/75 px-3 py-3 backdrop-blur-xl sm:px-4 md:px-8 md:py-4">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-primary blur-md opacity-60" />
              <img src={logoUrl} alt="KhusDesiConverter Logo" className="relative h-11 w-11 rounded-full border-2 border-primary/50 object-cover md:h-12 md:w-12" data-testid="img-logo" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-tight sm:text-lg md:text-2xl">Khus<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Desi</span>Converter</h1>
              <p className="hidden text-xs text-muted-foreground sm:block" data-testid="text-selected-summary">{selectedSummary}</p>
            </div>
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
            <a href="mailto:proreme123@gmail.com?subject=KhusDesiConverter%20Feedback" title="Contact Developer" className="inline-flex rounded-full border border-border bg-card px-3 py-2 text-xs font-bold transition-colors hover:border-primary/60" data-testid="link-contact">
              <Mail className="mr-0 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">📩 Contact</span>
            </a>
            <select value={theme} onChange={(event) => setTheme(event.target.value as AppTheme)} className="max-w-[7.4rem] rounded-full border border-border bg-card px-2 py-2 text-xs font-bold outline-none transition-colors hover:border-primary/60 sm:max-w-none sm:px-3" data-testid="select-theme">
              {THEMES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-2 text-xs font-bold sm:px-3">
              {isHealthLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : isHealthError || healthData?.status !== "ok" ? <WifiOff className="h-4 w-4 text-destructive" /> : <Wifi className="h-4 w-4 text-emerald-500" />}
              <span className="hidden sm:inline">{isHealthError ? "Offline" : "Online"}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 overflow-x-hidden px-3 py-6 sm:px-4 md:px-8 md:py-10">
        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div className="min-w-0 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-4 w-4" /> Persona-first AI engine</div>
            <h2 className="break-words text-3xl font-black tracking-tight sm:text-4xl md:text-6xl">Themes, personas, voice — <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">upgraded</span>.</h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">Convert one message through huge persona groups, global or Indian language systems, tone layers, and downloadable AI speech.</p>
          </div>
          <Card className="min-w-0 border-primary/20 bg-card/70 shadow-2xl shadow-primary/5 backdrop-blur-xl"><CardContent className="p-3 sm:p-4 md:p-5"><div className="grid grid-cols-2 gap-2 text-center text-xs font-bold sm:grid-cols-4 md:text-sm">{[["1", "Persona"], ["2", "Language"], ["3", "Tone"], ["4", "Audio"]].map(([step, label]) => <div key={step} className="min-w-0 rounded-2xl border border-border bg-background/60 p-3"><div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{step}</div><div className="break-words">{label}</div></div>)}</div></CardContent></Card>
        </section>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 space-y-6">
            <Card className="border-border/80 bg-card/80 backdrop-blur-xl">
              <CardContent className="space-y-4 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-black"><UserRound className="h-5 w-5 text-primary" /> Persona</h3><p className="text-sm text-muted-foreground">Search and select a structured persona style.</p></div><div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Saved</div></div>
                <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={personaSearch} onChange={(event) => setPersonaSearch(event.target.value)} placeholder="Search persona..." className="w-full rounded-2xl border border-border bg-background/70 py-3 pl-10 pr-4 text-sm font-semibold outline-none transition-colors focus:border-primary" data-testid="input-persona-search" /></div>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">{CATEGORY_TABS.map((category) => <button key={category} type="button" onClick={() => { setPersonaCategory(category); setPersonaSearch(""); }} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition-all ${personaCategory === category && !personaSearch ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background/70 hover:border-primary/60"}`} data-testid={`button-persona-tab-${compactTestId(category)}`}>{category}</button>)}</div>
                <div className="max-h-80 space-y-4 overflow-y-auto pr-1 scroll-smooth">
                  {visiblePersonaGroups.map((group) => <div key={group.category} className="space-y-2"><div className="text-xs font-black uppercase tracking-widest text-muted-foreground">{group.label}</div><div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-3">{group.personas.map((item) => <button key={item} type="button" onClick={() => setPersona(item)} className={`min-w-0 break-words rounded-2xl border px-3 py-2 text-left text-sm font-bold transition-all ${persona === item ? "border-primary bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,0,170,0.25)]" : "border-border bg-background/70 text-foreground/75 hover:border-primary/60 hover:bg-primary/10"}`} data-testid={`button-persona-${compactTestId(item)}`}>{item}</button>)}</div></div>)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/80 backdrop-blur-xl"><CardContent className="space-y-4 p-4 md:p-5"><div><h3 className="flex items-center gap-2 text-lg font-black"><Drama className="h-5 w-5 text-secondary" /> Tone</h3><p className="text-sm text-muted-foreground">Tone appears after a language is selected.</p></div>{language && <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{TONES.map((item) => <button key={item} type="button" onClick={() => setTone(item)} className={`rounded-2xl border p-4 text-left transition-all ${tone === item ? "border-secondary bg-secondary text-secondary-foreground shadow-[0_0_24px_rgba(0,220,255,0.25)]" : "border-border bg-background/70 hover:border-secondary/60 hover:bg-secondary/10"}`} data-testid={`button-tone-${compactTestId(item)}`}><div className="font-black">{item}</div><div className="mt-1 text-xs opacity-80">{item === "Formal" ? "Clean native feel" : item === "GenZ Male" ? "Bro-coded chat vibe" : "Expressive soft glam"}</div></button>)}</div>}</CardContent></Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card className="border-border/80 bg-card/80 backdrop-blur-xl"><CardContent className="space-y-4 p-4 md:p-5"><div><h3 className="flex items-center gap-2 text-lg font-black"><ActiveSectionIcon className="h-5 w-5 text-primary" /> Language</h3><p className="text-sm text-muted-foreground">Choose a tab, then select the exact language.</p></div><div className="grid grid-cols-3 gap-2">{(Object.keys(SECTION_META) as LanguageSection[]).map((section) => { const Icon = SECTION_META[section].icon; return <button key={section} type="button" onClick={() => selectSection(section)} className={`rounded-2xl border p-3 text-left transition-all ${languageSection === section ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background/70 hover:border-primary/60 hover:bg-primary/10"}`} data-testid={`button-language-tab-${compactTestId(section)}`}><Icon className="mb-2 h-5 w-5" /><div className="text-sm font-black">{SECTION_META[section].label}</div><div className="hidden text-[11px] opacity-80 sm:block">{SECTION_META[section].subtitle}</div></button>; })}</div><AnimatePresence mode="wait"><motion.div key={languageSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">{languageSection === "International" && <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">{INTERNATIONAL_LANGUAGES.map(renderLanguageChip)}</div>}{languageSection === "Indian" && <div className="max-h-96 space-y-5 overflow-y-auto pr-1">{INDIAN_LANGUAGE_GROUPS.map((group) => <div key={group.region} className="space-y-2"><div className="text-xs font-black uppercase tracking-widest text-muted-foreground">{group.region}</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{group.languages.map(renderLanguageChip)}</div></div>)}</div>}{languageSection === "Indianized" && <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">{INDIANIZED_LANGUAGES.map(renderLanguageChip)}</div>}</motion.div></AnimatePresence></CardContent></Card>

            <Card className="border-primary/20 bg-card/80 backdrop-blur-xl"><CardContent className="space-y-4 p-4 md:p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-black"><Wand2 className="h-5 w-5 text-primary" /> Input text</h3><p className="text-sm text-muted-foreground">Auto converts after you stop typing.</p></div><div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground" data-testid="text-auto-status">{isConverting ? "Converting" : isCached ? "Cached" : "Ready"}</div></div><Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Type here... e.g. Hi I am fine" className="min-h-36 resize-none rounded-3xl border-border bg-background/80 p-4 text-base shadow-inner focus-visible:ring-primary/50 md:text-lg" data-testid="input-text" /><div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" onClick={startSpeechInput} data-testid="button-speak-input"><Mic className="mr-2 h-4 w-4" /> Speak</Button><Button type="button" variant="outline" disabled={!text.trim() || loadingAudioKey === "input"} onClick={() => playAudio(text, "input")} data-testid="button-listen-input">{loadingAudioKey === "input" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : playingKey === "input" ? <Pause className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />} Listen</Button><Button type="button" variant={autoSpeak ? "default" : "outline"} onClick={() => setAutoSpeak((value) => !value)} data-testid="button-auto-speak">Auto Speak {autoSpeak ? "ON" : "OFF"}</Button><select value={voice} onChange={(event) => setVoice(event.target.value as typeof voice)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold"><option value="nova">Female</option><option value="onyx">Male</option><option value="alloy">Neutral</option><option value="shimmer">Soft</option></select><select value={speechRate} onChange={(event) => setSpeechRate(Number(event.target.value))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold"><option value={0.85}>Slow</option><option value={1}>Normal</option><option value={1.15}>Fast</option></select></div><div className="flex flex-wrap gap-2 text-xs font-bold text-muted-foreground"><span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{persona}</span><span className="rounded-full bg-secondary/10 px-3 py-1 text-secondary">{languageSection}</span><span className="rounded-full bg-muted px-3 py-1">{language}</span><span className="rounded-full bg-muted px-3 py-1">{tone}</span></div></CardContent></Card>
          </div>
        </section>

        <section><Card className="min-h-64 border-border/80 bg-card/80 backdrop-blur-xl"><CardContent className="p-4 md:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-black"><MessageSquare className="h-5 w-5 text-secondary" /> Output</h3><p className="text-sm text-muted-foreground">Five copy-ready variations with listen and save audio.</p></div>{isConverting && <Loader2 className="h-5 w-5 animate-spin text-primary" />}</div><AnimatePresence mode="wait">{!text.trim() ? <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/50 p-8 text-center"><Sparkles className="mb-3 h-8 w-8 text-primary" /><p className="font-bold">Start typing to generate outputs automatically.</p><p className="mt-1 text-sm text-muted-foreground">Then listen or save any generated voice.</p></motion.div> : isConverting ? <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-border bg-background/50 p-8 text-center"><Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" /><p className="font-bold">Blending persona, language, and tone...</p><p className="mt-1 text-sm text-muted-foreground">{selectedSummary}</p></motion.div> : variations ? <motion.div key={activeCacheKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid gap-3">{variations.map((variation, index) => { const key = `output-${index}-${activeCacheKey}`; return <motion.div key={`${variation}-${index}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`group relative overflow-hidden rounded-3xl border bg-background/70 p-4 transition-colors hover:border-secondary/60 ${playingKey === key ? "border-secondary shadow-[0_0_26px_rgba(0,220,255,0.22)]" : "border-border"}`} data-testid={`card-output-${index}`}><div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-secondary/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" /><div className="relative z-10 space-y-4"><p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed md:text-base" data-testid={`text-output-${index}`}>{variation}</p><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => handleCopy(variation, index)} data-testid={`button-copy-${index}`}>{copiedIndex === index ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />} Copy</Button><Button type="button" size="sm" variant="secondary" disabled={loadingAudioKey === key} onClick={() => playAudio(variation, key)} data-testid={`button-listen-${index}`}>{loadingAudioKey === key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : playingKey === key ? <Pause className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />} Listen</Button><Button type="button" size="sm" variant="outline" disabled={loadingAudioKey === key} onClick={() => downloadAudio(variation, key)} data-testid={`button-save-audio-${index}`}><Download className="mr-2 h-4 w-4" /> Save Audio</Button></div></div></motion.div>; })}</motion.div> : <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-44 items-center justify-center rounded-3xl border border-dashed border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">Waiting for conversion...</motion.div>}</AnimatePresence></CardContent></Card></section>
      </main>

      <footer className="relative z-10 border-t border-border/80 bg-background/75 p-6 text-center backdrop-blur-xl"><p className="text-sm font-semibold text-muted-foreground">made by AdaMo 🧡</p></footer>
    </div>
  );
}
