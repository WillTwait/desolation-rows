'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Lyric {
  id: string;
  lyric: string;
  created_at: string;
  stanza: number;
  isRefrain?: boolean;
}

// Track the length of each stanza
interface StanzaLength {
  stanza: number;
  length: number;
}

const INITIAL_LINES: Lyric[] = [
  {
    id: crypto.randomUUID(),
    lyric: 'Oh, where have you been, my blue-eyed son?',
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
  },
  {
    id: crypto.randomUUID(),
    lyric: 'Oh, where have you been, my darling young one?',
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
  },
  {
    id: crypto.randomUUID(),
    lyric: "I've stumbled on the side of twelve misty mountains",
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
  },
  {
    id: crypto.randomUUID(),
    lyric: "I've walked and I've crawled on six crooked highways",
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
  },
  {
    id: crypto.randomUUID(),
    lyric: "I've stepped in the middle of seven sad forests",
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
  },
  {
    id: crypto.randomUUID(),
    lyric: "I've been out in front of a dozen dead oceans",
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
  },
  {
    id: crypto.randomUUID(),
    lyric: "I've been ten thousand miles in the mouth of a graveyard",
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
  },
  {
    id: crypto.randomUUID(),
    lyric: "And it's a hard, and it's a hard, it's a hard, it's a hard",
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
    isRefrain: true,
  },
  {
    id: crypto.randomUUID(),
    lyric: "And it's a hard rain's a-gonna fall",
    created_at: new Date(1962, 12, 6).toISOString(),
    stanza: 1,
    isRefrain: true,
  },
];

export default function Home() {
  const [songLines, setSongLines] = useState<Lyric[]>(INITIAL_LINES);
  // Track current stanza we're working on (start with 2 since 1 is hardcoded)
  const [currentStanzaNumber, setCurrentStanzaNumber] = useState(2);
  const [stanzaLengths, setStanzaLengths] = useState<StanzaLength[]>([
    { stanza: 1, length: INITIAL_LINES.length },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // const supabase = createClient();

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, songLines.length]); // Only trigger on length changes

  // Function to determine stanza length (between 9 and 14 lines)
  const determineStanzaLength = () => {
    // More weight to shorter stanzas (9-11) than longer ones (12-14)
    const weights = [3, 3, 3, 2, 2, 1]; // Higher numbers = more likely
    let random = Math.random() * weights.reduce((a, b) => a + b, 0);

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return i + 9; // lengths 9-14
      }
    }
    return 9; // fallback
  };

  // Function to get current stanza info
  const getCurrentStanzaInfo = () => {
    // Sum up lengths of all previous stanzas (including initial)
    const previousStanzaEnds = stanzaLengths.reduce((sum, s) => {
      // Only include completed stanzas (less than current)
      if (s.stanza < currentStanzaNumber) {
        return sum + s.length;
      }
      return sum;
    }, 0);

    // Current length is how many lines we've written in the current stanza
    const currentLength = songLines.length - previousStanzaEnds;
    return { currentStanza: currentStanzaNumber, currentLength, previousStanzaEnds };
  };

  const generateNewLine = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const { currentStanza, currentLength, previousStanzaEnds } = getCurrentStanzaInfo();

      // For new stanzas (after the first hardcoded one)
      if (currentLength === 0) {
        const newLength = determineStanzaLength();
        setStanzaLengths((current) => [...current, { stanza: currentStanza, length: newLength }]);
      }

      const currentStanzaLength =
        stanzaLengths.find((s) => s.stanza === currentStanza)?.length || determineStanzaLength();
      const refrainStart = currentStanzaLength - 2;

      // Handle questions (first two lines of each stanza)
      const isQuestion = currentLength === 0 || currentLength === 1;

      if (isQuestion) {
        const response = await fetch('/api/generate?type=question', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to generate question');
        }

        const data = await response.json();
        const isFirstQuestion = currentLength === 0;

        const newLine: Lyric = {
          id: crypto.randomUUID(),
          lyric: isFirstQuestion ? data.blueEyedSon : data.darlingYoungOne,
          created_at: new Date().toISOString(),
          stanza: currentStanza,
        };

        setSongLines((current) => [...current, newLine]);
        return;
      }

      // If we're at the refrain lines (last two lines of the stanza)
      if (currentLength >= refrainStart) {
        const isLastLine = currentLength === currentStanzaLength - 1;
        const newLine: Lyric = {
          id: crypto.randomUUID(),
          lyric: isLastLine
            ? "And it's a hard rain's a-gonna fall"
            : "And it's a hard, and it's a hard, it's a hard, it's a hard",
          created_at: new Date().toISOString(),
          stanza: currentStanza,
          isRefrain: true,
        };
        setSongLines((current) => [...current, newLine]);

        // If this was the last line of the stanza, prepare for next stanza
        if (isLastLine) {
          setCurrentStanzaNumber((current) => current + 1);
        }
        return;
      }

      // Handle regular response lines
      const stanzaStart = previousStanzaEnds;

      const currentStanzaLyrics = songLines.slice(stanzaStart);

      // Make sure we have lyrics and can access the question
      if (!currentStanzaLyrics.length) {
        throw new Error('Cannot find current stanza lyrics');
      }

      // Get the first line (question) of the current stanza
      const currentStanzaQuestion = currentStanzaLyrics[0].lyric;

      // Get all non-refrain lines after the questions
      const existingLyrics = currentStanzaLyrics
        .slice(2) // Skip the two question lines
        .filter((l) => !l.isRefrain)
        .map((l) => l.lyric);

      const params = new URLSearchParams();
      params.append('type', 'lyric');
      params.append('question', currentStanzaQuestion);
      for (const lyric of existingLyrics) {
        params.append('existingLyrics', lyric);
      }

      const response = await fetch(`/api/generate?${params}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate lyric');
      }

      const data = await response.json();
      const newLine: Lyric = {
        id: crypto.randomUUID(),
        lyric: data.lyric,
        created_at: new Date().toISOString(),
        stanza: currentStanza,
      };

      setSongLines((current) => [...current, newLine]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    return (
      <div className="space-y-1">
        {songLines.map((line, index) => {
          const isOriginal = line.created_at === INITIAL_LINES[0].created_at;

          return (
            <div key={line.id}>
              <div className="flex items-start gap-4">
                <span className="font-mono text-gray-400 text-sm select-none">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p
                  className={`font-mono text-base ${isOriginal ? '' : 'text-gray-600'} ${
                    line.isRefrain ? 'pl-8' : ''
                  }`}
                >
                  {line.lyric}
                </p>
              </div>
              {stanzaLengths.reduce((sum, s) => sum + s.length, 0) === index + 1 && (
                <div className="h-8" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-6 tracking-tight leading-snug">
      <div className="text-2xl md:text-3xl">
        <strong className="border-2 border-black px-1 rounded-sm">Desolation Rows</strong>
      </div>

      <div className="text-base md:text-xl flex flex-col gap-2">
        <p>
          An AI exploration of Bob Dylan's "A Hard Rain's A-Gonna Fall", generating new verses in
          his style. Each stanza begins with two questions, followed by responses, and ends with the
          iconic refrain.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div
          ref={scrollContainerRef}
          className="h-[600px] overflow-y-auto border border-gray-200 rounded-md p-6 bg-white"
        >
          {renderContent()}
        </div>

        <div className="flex flex-col gap-2">
          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="button"
            onClick={generateNewLine}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
          >
            {isGenerating ? 'Writing...' : 'Write Next Line'}
          </button>
        </div>
      </div>
    </section>
  );
}
