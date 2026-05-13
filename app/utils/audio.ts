import { createSpeechPlayer } from "@/app/utils/ms_edge_tts";
import { createTTSPlayer } from "@/app/utils/ms_edge_tts";

export interface TTSPlayer {
  type: "edge" | "web";
  play: (text: string) => void;
  stop: () => void;
  speaking: boolean;
}

function edgePlayer(): TTSPlayer {
  const player = createTTSPlayer(createSpeechPlayer);
  return {
    type: "edge",
    play: (text: string) => player?.play(text),
    stop: () => player?.stop(),
    speaking: player?.speaking ?? false,
  };
}

function webPlayer(): TTSPlayer {
  const utteranceRef = { current: null as SpeechSynthesisUtterance | null };
  const speakingRef = { current: false };

  return {
    type: "web",
    play: (text: string) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => (speakingRef.current = true);
      utterance.onend = () => (speakingRef.current = false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    stop: () => {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    },
    get speaking() {
      return speakingRef.current;
    },
  };
}

let ttsPlayer: TTSPlayer | null = null;

export function createTTSPlayer(type: "edge" | "web" = "edge"): TTSPlayer {
  if (ttsPlayer) return ttsPlayer;
  ttsPlayer = type === "edge" ? edgePlayer() : webPlayer();
  return ttsPlayer;
}
