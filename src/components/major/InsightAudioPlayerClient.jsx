"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WAVEFORM_BARS = [
  10, 14, 18, 14, 10, 8, 6, 5, 6, 8, 12, 26, 34, 30, 22, 36, 28, 40, 24, 32,
  38, 20, 30, 26, 34, 40, 28, 22, 18, 24, 20, 26, 34, 30, 38, 26,
];
const MAX_BAR_HEIGHT = 40;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function InsightAudioPlayerClient({ audioUrl, title }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progress = duration > 0 ? currentTime / duration : 0;
  const activeBarCount = Math.round(progress * WAVEFORM_BARS.length);
  const formattedCurrentTime = useMemo(() => formatTime(currentTime), [currentTime]);
  const formattedDuration = useMemo(() => formatTime(duration), [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const syncTime = () => setCurrentTime(audio.currentTime || 0);
    const syncDuration = () => setDuration(audio.duration || 0);
    const stopPlayback = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("ended", stopPlayback);

    return () => {
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("ended", stopPlayback);
    };
  }, []);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function seekToBar(index) {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const nextProgress = index / Math.max(WAVEFORM_BARS.length - 1, 1);
    audio.currentTime = duration * nextProgress;
    setCurrentTime(audio.currentTime);
  }

  if (!audioUrl) return null;

  return (
    <section className="overflow-hidden rounded-[10px] border border-[#1E2E31] px-6 py-6 text-[#1E2E31]">
      <h2 className="mb-6 text-[20px] font-normal leading-tight">
        {title}
      </h2>

      <audio ref={audioRef} preload="metadata" src={audioUrl} />

      <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-6">
        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B8D1D1] text-[#1E2E31] transition-opacity hover:opacity-85"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <span className="flex items-center gap-[4px]" aria-hidden="true">
              <span className="h-5 w-[4px] rounded-full bg-[#1E2E31]" />
              <span className="h-5 w-[4px] rounded-full bg-[#1E2E31]" />
            </span>
          ) : (
            <span
              className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-[#1E2E31]"
              aria-hidden="true"
            />
          )}
        </button>

        <div className="min-w-0 overflow-hidden">
          <div
            className="grid h-12 grid-flow-col auto-cols-[1px] items-end justify-between overflow-hidden"
            aria-hidden="true"
          >
            {WAVEFORM_BARS.map((height, index) => (
              <button
                key={`${height}-${index}`}
                type="button"
                onClick={() => seekToBar(index)}
                className="flex h-12 w-px cursor-pointer items-end justify-center p-0"
                tabIndex={-1}
              >
                <span
                  className="block w-px bg-[#1E2E31] transition-opacity duration-150"
                  style={{
                    height: `${Math.min(height, MAX_BAR_HEIGHT)}px`,
                    opacity: index <= activeBarCount ? 1 : 0.3,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between text-[14px] leading-none">
            <span>{formattedCurrentTime}</span>
            <span>{formattedDuration}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
