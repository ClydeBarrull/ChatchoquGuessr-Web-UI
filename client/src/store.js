
import create from 'zustand';

const useGameStore = create((set) => ({
  socket: null,
  stage: 'join', // join | waiting | queued | playing | over | cancelled
  selection: null,
  selectionCorrect: null,
  results: {},
  isHost: false,
  name: '',
  round: 0,
  phaseStart: 0,
  revealDelay: 0,
  timeLeft: 0,
  visibleMessages: [],
  allMessages: [],
  authors: [],
  leaderboard: [],
  podium: [],
  initSocket: (socket) => set({ socket }),
  setName: (name) => set({ name }),
  setStage: (stage) => set({ stage }),
  setQueued: () => set({ stage: 'queued'}),
  setSelection: (author) => set({selection:author}),
  setSelectionCorrect: (bool) => set({ selectionCorrect: bool }),
  setHost: (bool) => set({ isHost: bool }),
  addGuessResult: ({ name, correct }) =>
    set((state) => ({
      results: { ...state.results, [name]: correct },

      selectionCorrect:
        name === state.name ? correct : state.selectionCorrect,
    })),
  setRoundData: (data) =>
    set((state) => ({
      round: data.round,
      phaseStart: data.phaseStart,
      revealDelay: data.revealDelay,
      timeLeft: Math.ceil(data.revealDelay / 1000),
      allMessages: data.messages,
      visibleMessages: [data.messages[0]],
      authors: data.authors,
      leaderboard: data.leaderboard || state.leaderboard,
      selection: null,
      selectionCorrect: null,
      results: {},
      stage: 'playing',
    })),
  revealNext: (visibleIdx, delay, phaseStart) =>
    set((state) => ({
      visibleMessages: state.allMessages.slice(0, visibleIdx + 1),
      phaseStart,
      revealDelay: delay,
      timeLeft: Math.ceil(delay / 1000),
    })),
  tick: () =>
    set((s) => ({
      timeLeft: Math.max(
        0,
        Math.ceil((s.phaseStart + s.revealDelay - Date.now()) / 1000)
      ),
  })),
  updateLeaderboard: (board) => set({ leaderboard: board }),
  setCancelled: () => set({ stage: 'cancelled', isHost: false }),
  setPodium: (podium) => set({ podium, stage: 'over' }),
}));

export default useGameStore;
