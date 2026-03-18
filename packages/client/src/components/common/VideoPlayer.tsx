import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  /** Cloudinary secure URL (mp4 or m3u8 HLS) */
  url: string;
  title?: string;
  /** autoplay on mount? default false */
  autoPlay?: boolean;
  className?: string;
}

/**
 * VideoPlayer
 * -----------
 * Wraps react-player to stream videos from Cloudinary CDN.
 * Supports mp4, webm, quicktime and HLS (.m3u8) adaptive streams.
 * No server bandwidth is consumed – the browser connects directly to Cloudinary.
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  autoPlay = false,
  className = '',
}) => {
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [played, setPlayed] = useState(0); // 0-1 fraction
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);

  const formatTime = (secs: number) => {
    if (!isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center ${className}`}
      >
        <span className="material-symbols-outlined text-4xl text-red-400">error</span>
        <p className="text-sm font-medium text-red-600">Failed to load video.</p>
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {title && <h3 className="text-sm font-semibold text-slate-700 truncate">{title}</h3>}

      {/* Player wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video shadow-md">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <span className="material-symbols-outlined animate-spin text-3xl text-slate-400">
              progress_activity
            </span>
          </div>
        )}

        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          width="100%"
          height="100%"
          onReady={() => setReady(true)}
          onDuration={setDuration}
          onProgress={({ played }) => setPlayed(played)}
          onError={(e) =>
            setError(typeof e === 'string' ? e : 'Playback error. Check your network connection.')
          }
          config={{
            file: {
              attributes: { controlsList: 'nodownload' },
              forceHLS: url.includes('.m3u8'),
            },
          }}
        />
      </div>

      {/* Custom controls bar */}
      <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2">
        {/* Play / Pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-900 text-white hover:bg-primary-900/90 transition"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <span className="material-symbols-outlined text-base">
            {playing ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={played}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setPlayed(val);
            playerRef.current?.seekTo(val, 'fraction');
          }}
          className="flex-1 h-1.5 accent-primary-900 cursor-pointer"
          aria-label="Seek"
        />

        {/* Time */}
        <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
          {formatTime(played * duration)} / {formatTime(duration)}
        </span>

        {/* Volume */}
        <button
          onClick={() => setMuted((m) => !m)}
          className="text-slate-500 hover:text-slate-700 transition"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          <span className="material-symbols-outlined text-base">
            {muted ? 'volume_off' : 'volume_up'}
          </span>
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setMuted(false);
          }}
          className="w-16 h-1.5 accent-primary-900 cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
