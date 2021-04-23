import { ReactNode, useContext } from 'react';
import { createContext, useCallback, useState } from 'react';

interface Episode {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
}

interface IPlayerContextData {
  episodeList: Episode[];
  currentEpisodeIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  play: (episode: Episode) => void;
  playList: (list: Episode[], index: number) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setPlayingState: (state: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlayerState: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface IPlayerContextProviderProps {
  children: ReactNode;
}

export const PlayerContext = createContext({} as IPlayerContextData);

export function PlayerContextProvider({
  children,
}: IPlayerContextProviderProps): JSX.Element {
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const play = useCallback((episode: Episode) => {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  }, []);

  const playList = useCallback((list: Episode[], index: number) => {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleLoop = useCallback(() => {
    setIsLooping(!isLooping);
  }, [isLooping]);

  const toggleShuffle = useCallback(() => {
    setIsShuffling(!isShuffling);
  }, [isShuffling]);

  const setPlayingState = useCallback((state: boolean) => {
    setIsPlaying(state);
  }, []);

  const clearPlayerState = useCallback(() => {
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }, []);

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || currentEpisodeIndex + 1 < episodeList.length;

  const playNext = useCallback(() => {
    if (isShuffling) {
      const nextRandorEpisodeIndex = Math.floor(
        Math.random() * episodeList.length,
      );
      setCurrentEpisodeIndex(nextRandorEpisodeIndex);
    } else if (hasNext) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  }, [currentEpisodeIndex, isShuffling]);

  const playPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  }, [currentEpisodeIndex]);

  return (
    <PlayerContext.Provider
      value={{
        episodeList,
        currentEpisodeIndex,
        isLooping,
        isShuffling,
        play,
        playList,
        playNext,
        playPrevious,
        isPlaying,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        clearPlayerState,
        hasNext,
        hasPrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  return useContext(PlayerContext);
};
