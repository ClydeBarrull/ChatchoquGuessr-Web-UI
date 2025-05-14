
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import useStore from './store';

import MessageCard from './components/MessageCard';
import AuthorButton from './components/AuthorButton';
import ScoreBoard from './components/ScoreBoard';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
  const store = useStore();
  const { stage, allMessages, visibleMessages, authors, leaderboard,
          round, socket, name, podium, isHost,
          selection, selectionCorrect, results,
          timeLeft, revealDelay } = store;
  const [inputName, setInputName] = useState('');

  useEffect(() => {
    const s = io(socketUrl);
    store.initSocket(s);

    s.on('roundStart', (data) => {
      store.setRoundData(data);
      store.setHost(s.id == data.hostId);
    });

    s.on('hostAssigned', () => store.setHost(true));

    s.on('notEnoughPlayers', () => {
      alert('Tu vas pas jouer tout seul c trop triste...');
    });

    s.on('revealNext', ({ visible, revealDelay, phaseStart }) => {
      store.revealNext(visible, revealDelay, phaseStart);
      s.on('guessResult', (payload) => store.addGuessResult(payload));
    });

    s.on('scoreUpdate', (board) => {
      store.updateLeaderboard(board);
    });

    s.on('gameInProgress', () => {
      store.setQueued();
    })

    s.on('gameCancelled', () => {
      store.setCancelled();
    })
    s.on('gameOver', (ranking) => {
      store.setPodium(ranking);
    });

    s.on('nameTaken', () => {
      alert('Nom déjà pris déso :(');
      store.setStage('join');
    });

    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (stage !== 'playing') return;
    const id = setInterval(() => store.tick(), 1000);
    return () => clearInterval(id);
  }, [stage]);

  const handleJoin = () => {
    if (!inputName.trim() || !socket) return;
    store.setName(inputName.trim());
    socket.emit('join', inputName.trim());
    
    store.setStage('waiting');
  };

  const handleStart = () => {
    socket?.emit('startGame');
  };

  
const handleCancel = () => {
  if (!isHost) return;
  socket?.emit('cancelGame');
  store.setCancelled();
};

const handleGuess = (author) => {
  if (selection) return;
  socket?.emit('guess', { round, guess: author });
  store.setSelection(author);
};

  if (stage === 'join') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-3xl font-bold">ChatchoquGuessr WEB UI</h1>
        <input
          className="border p-2 rounded"
          placeholder="Enter your name"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleJoin}
        >
          Rejoindre
        </button>
      </div>
    );
  }

  if (stage === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-xl">En attente de partie...</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleStart}
        >
          Lancer la partie
        </button>
      </div>
    );
  }

  if (stage === 'queued') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-xl">Vous rejoindrez au prochain round…</h2>
      </div>
    );
  }

  if (stage === 'playing') {
    return (
      <>
      
        {isHost && (
          <button
            className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleCancel}
          >
            Annuler la partie
          </button>
        )}

        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Round {round}</h2>
          <div className="flex items-center gap-4 mb-4 text-lg">
            <span>
              ⏱ {timeLeft}s
            </span>
            <span>
              ⭐ {5 - 1 * (visibleMessages.length - 1)} points pour une bonne réponse
            </span>
          </div>
          <div className="flex flex-col gap-4 mb-6">
            {allMessages.map((msg, idx) => (
                <MessageCard
                  key={idx}
                  message={msg}
                  placeholder={idx >= visibleMessages.length}
                />
              ))}
          </div>
          <h2 className="text-2xl font-semibold mb-4">Clique sur la personne que penses être l'auteur ou l'autrice...</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            {authors
              .filter(Boolean)                   // keeps only truthy items
              .map((a) => (
                <AuthorButton
                  key={a}
                  author={a}
                  disabled={!!selection}
                  highlight={selection === a ? selectionCorrect : null}
                  onClick={() => handleGuess(a)}
                />
            ))}
          </div>
          <ScoreBoard leaderboard={leaderboard} results={results} />
        </div>
      </>
    );
  }

  
if (stage === 'cancelled') {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-3xl font-bold">Partie annulée par l'hôte !</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => window.location.reload()}
      >
        Retour au lobby
      </button>
    </div>
    );
  }

  if (stage === 'over') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <h1 className="text-3xl font-bold">C FINI #L9</h1>
        <div className="flex flex-col gap-2">
          {podium.slice(0, 3).map((p, idx) => (
            <div key={p.name} className="text-lg">
              {idx + 1}. {p.name} — {p.score}
            </div>
          ))}
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Retour au lobby
        </button>
      </div>
    );
  }

  return null;
}

export default App;
