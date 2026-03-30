import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { toast } from "sonner";
import { ChevronLeft, Gem, Heart, Sparkles } from "lucide-react";
import pinkMoonImg from "@/assets/pink-moon.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoneyPinkMoonSlider } from "@/components/HoneyPinkMoonSlider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const STORAGE_LETTERS = "pm_letters_v2";
const STORAGE_CRYSTALS = "pm_crystals_v1";
const STORAGE_GOAL = "pm_goal_v1";

const horizons = [
  {
    key: "d3",
    label: "",
    phase: "",
    title: "",
    body: "",
    prompt: "三日後の自分へ。いまの胸のざわめきをたいせつに",
  },
  {
    key: "w1",
    label: "",
    phase: "",
    title: "",
    body: "",
    prompt: "一週間後の自分へ。世界が変わり始めたかも",
  },
  {
    key: "m1",
    label: "",
    phase: "",
    title: "",
    body: "",
    prompt: "一か月後の自分へ。誰を思い出していますか？",
  },
  {
    key: "y1",
    label: "",
    phase: "",
    title: "",
    body: "",
    prompt: "一年後の自分へ。どんな恋をしていたいですか？",
  },
  {
    key: "y3",
    label: "",
    phase: "",
    title: "",
    body: "",
    prompt: "三年後の自分へ。いまの恋は、どんな章に入っていますか？",
  },
  {
    key: "y50",
    label: "",
    phase: "",
    title: "",
    body: "",
    prompt: "50年後のふたり　手をつないでいられますように",
  },
  {
    key: "y100",
    label: "",
    phase: "",
    title: "",
    body: "",
    prompt: "100年先の宇宙へ。あなたの声は美しいまま",
  },
] as const;

type HorizonKey = (typeof horizons)[number]["key"];

const HORIZON_KEYS: HorizonKey[] = horizons.map((h) => h.key);

function emptyLetters(): Record<HorizonKey, string> {
  return Object.fromEntries(HORIZON_KEYS.map((k) => [k, ""])) as Record<HorizonKey, string>;
}

type Crystal = {
  id: string;
  text: string;
  horizon: HorizonKey;
  emotion: string;
  createdAt: string;
};

function loadLetters(): Record<HorizonKey, string> {
  const base = emptyLetters();
  try {
    const raw = localStorage.getItem(STORAGE_LETTERS);
    if (!raw) return base;
    const p = JSON.parse(raw) as Record<string, string>;
    for (const k of HORIZON_KEYS) {
      if (typeof p[k] === "string") base[k] = p[k];
    }
    return base;
  } catch {
    return base;
  }
}

function saveLetters(letters: Record<HorizonKey, string>) {
  localStorage.setItem(STORAGE_LETTERS, JSON.stringify(letters));
}

function loadCrystals(): Crystal[] {
  try {
    const raw = localStorage.getItem(STORAGE_CRYSTALS);
    if (!raw) return [];
    return JSON.parse(raw) as Crystal[];
  } catch {
    return [];
  }
}

function saveCrystals(list: Crystal[]) {
  localStorage.setItem(STORAGE_CRYSTALS, JSON.stringify(list));
}

type SavedGoal = { text: string; savedAt: string };

function loadGoal(): SavedGoal | null {
  try {
    const raw = localStorage.getItem(STORAGE_GOAL);
    if (!raw) return null;
    return JSON.parse(raw) as SavedGoal;
  } catch {
    return null;
  }
}

function saveGoal(g: SavedGoal) {
  localStorage.setItem(STORAGE_GOAL, JSON.stringify(g));
}

const StarfieldFlow = ({ active, flowKey }: { active: boolean; flowKey: number }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: `${flowKey}-${i}`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2,
        duration: 4 + Math.random() * 8,
        delay: Math.random() * 2,
      })),
    [flowKey],
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 3}px hsl(330 100% 85% / 0.9)`,
          }}
          initial={{ x: 0, opacity: 0.3 }}
          animate={{ x: ["0vw", "-120vw"], opacity: [0.2, 1, 0.4] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

const LongTermGoalView = () => {
  const [sliderIdx, setSliderIdx] = useState(0);
  const h = horizons[sliderIdx];
  const [letters, setLetters] = useState<Record<HorizonKey, string>>(loadLetters);
  const draft = letters[h.key];
  const setDraft = useCallback(
    (value: string) => {
      setLetters((prev) => ({ ...prev, [h.key]: value }));
    },
    [h.key],
  );
  const [crystals, setCrystals] = useState<Crystal[]>(loadCrystals);
  const [emotionTag, setEmotionTag] = useState("");
  const [goalText, setGoalText] = useState(() => loadGoal()?.text ?? "");
  const [savedGoalAt, setSavedGoalAt] = useState<string | null>(() => loadGoal()?.savedAt ?? null);
  const [flowKey, setFlowKey] = useState(0);
  const [starFlow, setStarFlow] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    saveLetters(letters);
  }, [letters]);

  const span = Math.max(1, horizons.length - 1);
  const pinkOverlay = 0.14 + (sliderIdx / span) * 0.66;
  const bgHueShift = 296 + sliderIdx * 6;

  const sendToFuture = useCallback(async () => {
    setStarFlow(true);
    setFlowKey((k) => k + 1);
    await controls.start({
      scale: [1, 1.08, 1],
      transition: { duration: 0.85, ease: "easeInOut" },
    });
    toast.success("星空が百年を流れました", {
      description: "未来の自分へ、いまの想いをそっと預けました。",
    });
    setTimeout(() => setStarFlow(false), 12000);
  }, [controls]);

  const onMoonDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 72;
    if (info.offset.x > threshold || info.velocity.x > 400) {
      void sendToFuture();
    }
  };

  const crystallize = () => {
    const text = draft.trim();
    if (!text) {
      toast.message("言葉を残してから結晶化してください");
      return;
    }
    const c: Crystal = {
      id: crypto.randomUUID(),
      text,
      horizon: h.key,
      emotion: emotionTag.trim() || "恋",
      createdAt: new Date().toISOString(),
    };
    const next = [c, ...crystals];
    setCrystals(next);
    saveCrystals(next);
    toast.success("ピンクの結晶を保存しました", {
      description: "いつかのあなたが、ここを開けます。",
    });
  };

  const saveTenYearGoal = () => {
    const t = goalText.trim();
    if (!t) {
      toast.message("未来の目標を書いてください");
      return;
    }
    const at = new Date().toISOString();
    saveGoal({ text: t, savedAt: at });
    setSavedGoalAt(at);
    toast.success("羅針盤に刻みました", {
      description: "）",
    });
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden">
      <motion.div
        className="relative min-h-full"
        animate={{
          background: [
            `linear-gradient(165deg, hsl(250 35% 9%) 0%, hsl(${bgHueShift} ${38 + sliderIdx * 5}% ${10 + sliderIdx * 2}%) 45%, hsl(340 45% 8%) 100%)`,
          ],
        }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ backgroundColor: `hsl(330 90% 55% / ${pinkOverlay})` }}
          animate={{ opacity: 1 }}
        />

        <StarfieldFlow active={starFlow} flowKey={flowKey} />

        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/40 bg-background/40 px-4 py-3 backdrop-blur-md">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/" aria-label="トップへ">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm tracking-wider text-foreground/90">未来への手紙</p>
            <p className="truncate text-xs text-muted-foreground">Pink Moon · 4/2 · 恋に誘われて</p>
          </div>
          <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        </header>

        <div className="relative z-20 mx-auto max-w-lg px-4 pb-24 pt-8">
          <section className="mb-10 text-center">
            <h1 className="font-display text-2xl font-light tracking-[0.2em] glow-text sm:text-3xl">
              百年のロマン
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              スライダーで時代を選びます。月を右へ送ると、3日後、1週間後、1ヶ月後.....100年後まで時間が流れます。
            </p>
          </section>

          <Card className="mb-8 border-primary/25 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-center text-sm">
                {h.phase ? `${h.label} · ${h.phase}` : h.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <HoneyPinkMoonSlider
                value={sliderIdx}
                onChange={setSliderIdx}
                steps={horizons.length}
                labels={horizons.map((x) => x.label)}
              />

              <div className="relative flex flex-col items-center gap-2 pb-2 pt-4">
                <p className="text-center text-xs text-muted-foreground">月を右（未来）へスワイプして送る</p>
                <div className="relative h-36 w-full max-w-[280px]">
                  <div className="absolute inset-x-8 bottom-2 top-8 rounded-full border border-dashed border-primary/35 bg-primary/5" />
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 140 }}
                    dragElastic={0.12}
                    onDragEnd={onMoonDragEnd}
                    className="absolute left-6 top-4 cursor-grab touch-pan-y active:cursor-grabbing"
                    whileTap={{ scale: 1.03 }}
                  >
                    <motion.div animate={controls}>
                      <img
                        src={pinkMoonImg}
                        alt=""
                        width={120}
                        height={120}
                        className="moon-glow h-24 w-24 select-none sm:h-28 sm:w-28"
                        draggable={false}
                      />
                    </motion.div>
                  </motion.div>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] text-primary/70">
                    未来 →
                  </span>
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl text-foreground">{h.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="letter" className="text-foreground/90">
                  {h.prompt}
                </Label>
                <Textarea
                  id="letter"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="未来の自分へ"
                  className="min-h-[120px] resize-none border-primary/20 bg-background/80"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className="gap-2" onClick={crystallize}>
                  <Gem className="h-4 w-4" />
                  想いを結晶化
                </Button>
                
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Gem className="h-5 w-5 text-primary" />
                恋のアーカイブ
              </CardTitle>
              <CardDescription>想いの欠片をここに残して</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                {crystals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">まだ結晶はありません。</p>
                ) : (
                  <ul className="space-y-3">
                    {crystals.map((c) => (
                      <motion.li
                        key={c.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">{c.emotion}</span>
                          <span>
                            {horizons.find((x) => x.key === c.horizon)?.label ?? c.horizon} ·{" "}
                            {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{c.text}</p>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

         
        </div>
      </motion.div>
    </div>
  );
};

export default LongTermGoalView;
