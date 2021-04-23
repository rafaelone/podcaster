import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player(): JSX.Element {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
    clearPlayerState,
    hasNext,
    hasPrevious,
    isLooping,
  } = usePlayer();

  const episode = episodeList[currentEpisodeIndex];

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const setupProgressListener = useCallback(() => {
    audioRef.current.currentTime = 0;
    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }, []);

  const handleSeek = useCallback((amount: number) => {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }, []);

  const handleEpisodeEnded = useCallback(() => {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }, [hasNext]);

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>
      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            objectFit="cover"
            width={592}
            height={592}
            src={episode.thumbnail}
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}
      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                onChange={handleSeek}
                max={episode.duration}
                value={progress}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>
        {episode && (
          <audio
            src={episode.url}
            autoPlay
            onEnded={handleEpisodeEnded}
            ref={audioRef}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            loop={isLooping}
            onLoadedMetadata={setupProgressListener}
          />
        )}
        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button
            type="button"
            disabled={!episode || !hasPrevious}
            onClick={playPrevious}
          >
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="Pausar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
            )}
          </button>
          <button
            type="button"
            disabled={!episode || !hasNext}
            onClick={playNext}
          >
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          <button
            className={isLooping ? styles.isActive : ''}
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
