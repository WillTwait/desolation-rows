'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useRef, useState } from 'react';

interface SongLine {
  id: string;
  lyric: string;
  created_at: string;
  is_question: boolean;
  question: string;
}

interface StanzaBreak {
  type: 'break' | 'refrain';
}

const INITIAL_LINES: SongLine[] = [
  {
    id: '1',
    lyric: 'Oh, where have you been, my blue-eyed son?',
    created_at: new Date(1962, 12, 6).toISOString(),
    is_question: true,
    question: 'Where have you been?',
  },
  {
    id: '2',
    lyric: 'Oh, where have you been, my darling young one?',
    created_at: new Date(1962, 12, 6).toISOString(),
    is_question: true,
    question: 'Where have you been?',
  },
  {
    id: '3',
    lyric: "I've stumbled on the side of twelve misty mountains",
    created_at: new Date(1962, 12, 6).toISOString(),
    is_question: false,
    question: 'Where have you been?',
  },
  {
    id: '4',
    lyric: "I've walked and I've crawled on six crooked highways",
    created_at: new Date(1962, 12, 6).toISOString(),
    is_question: false,
    question: 'Where have you been?',
  },
  {
    id: '5',
    lyric: "I've stepped in the middle of seven sad forests",
    created_at: new Date(1962, 12, 6).toISOString(),
    is_question: false,
    question: 'Where have you been?',
  },
  {
    id: '6',
    lyric: "I've been out in front of a dozen dead oceans",
    created_at: new Date(1962, 12, 6).toISOString(),
    is_question: false,
    question: 'Where have you been?',
  },
  {
    id: '7',
    lyric: "I've been ten thousand miles in the mouth of a graveyard",
    created_at: new Date(1962, 12, 6).toISOString(),
    is_question: false,
    question: 'Where have you been?',
  },
];

export default function Home() {
  const [songLines, setSongLines] = useState<SongLine[]>(INITIAL_LINES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Add scroll effect when songLines changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [songLines]);

  const generateNewLine = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Determine if this should be a question (first two lines of a stanza)
      const isQuestion = songLines.length % 7 < 2;
      const perspective =
        isQuestion && songLines.length % 14 === 0 ? 'blue-eyed son' : 'darling young one';

      // Get the current stanza's question if we're generating an answer
      const currentStanza = Math.floor(songLines.length / 7);
      const currentQuestion = !isQuestion
        ? songLines[currentStanza * 7].question // Get the first question of the current stanza
        : undefined;

      const response = await fetch(
        `/api/generate?isQuestion=${isQuestion}${
          currentQuestion ? `&currentQuestion=${encodeURIComponent(currentQuestion)}` : ''
        }${isQuestion ? `&perspective=${encodeURIComponent(perspective)}` : ''}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate line');
      }

      const data = await response.json();

      // Create a temporary ID for immediate local update
      const tempLine: SongLine = {
        id: crypto.randomUUID(),
        lyric: data.lyric,
        created_at: new Date().toISOString(),
        is_question: isQuestion,
        // If it's a question, use the generated question, otherwise use the current stanza's question
        question: isQuestion ? data.question : currentQuestion!,
      };

      // Update local state immediately
      setSongLines((current) => [...current, tempLine]);

      // Then save to Supabase
      const { error: saveError } = await supabase.from('lyrics').insert([
        {
          lyric: data.lyric,
          question: isQuestion ? data.question : currentQuestion!,
          is_question: isQuestion,
        },
      ]);

      if (saveError) throw saveError;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    const content: (SongLine | StanzaBreak)[] = [];

    songLines.forEach((line, index) => {
      // Add the line
      if (index % 7 === 0 && index > 0) {
        // Add refrain
        content.push({ type: 'refrain' });
        // Add stanza break
        content.push({ type: 'break' });
      }

      // For first two lines of each stanza, mark as questions
      const isQuestion = index % 7 < 2;
      content.push({ ...line, is_question: isQuestion });
    });

    return (
      <div>
        {content.map((item, contentIndex) => {
          if ('type' in item) {
            if (item.type === 'break') {
              return <div key={`break-${contentIndex.toString()}`} className="h-12" />;
            }
            if (item.type === 'refrain') {
              return (
                <div
                  key={`refrain-${contentIndex.toString()}`}
                  className="font-mono text-lg leading-relaxed tracking-tight space-y-2 pl-8"
                >
                  <p>And it's a hard, and it's a hard, it's a hard, it's a hard</p>
                  <p>&nbsp;</p>
                  <p>And it's a hard rain's a-gonna fall</p>
                </div>
              );
            }
            return null;
          }

          const songLine = item;
          const isOriginal = Number(songLine.id) <= INITIAL_LINES.length;
          return (
            <div key={songLine.id} className="group">
              <div className="flex items-start hover:bg-white/50 p-2 rounded transition-colors">
                <span className="font-mono text-gray-400 w-8 text-sm pt-1.5 select-none">
                  {String(contentIndex + 1).padStart(2, '0')}
                </span>
                <p
                  className={`flex-1 font-mono text-lg leading-relaxed tracking-tight ${
                    isOriginal ? '' : 'text-gray-600 border-l-2 border-gray-300 pl-3'
                  }`}
                >
                  {songLine.lyric}
                </p>
              </div>
              <div className="h-px bg-gray-200 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col items-center">
      <div ref={scrollContainerRef} className="notebook-line overflow-y-auto pr-4 w-[50%] h-[75%]">
        {renderContent()}
      </div>

      <div className="mt-6 w-[50%]">
        {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

        <button
          type="button"
          onClick={generateNewLine}
          disabled={isGenerating}
          className="w-full py-3 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-lg"
        >
          {isGenerating ? 'Writing...' : 'Write Next Line'}
        </button>
      </div>
    </div>
  );
}
