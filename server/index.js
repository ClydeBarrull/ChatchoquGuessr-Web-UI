
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { pickRounds, scoreGuess } from './gameEngine.js';

const PORT = process.env.PORT || 3001;
import { fileURLToPath } from 'url';
import path from 'path';
const CSV_PATH = path.resolve(fileURLToPath(new URL('../data/quotes.csv', import.meta.url)));

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const csvRows = parse(fs.readFileSync(CSV_PATH), {
  columns: true,                      // use the header row as-is
  skip_empty_lines: true
});

let inGame = false;
let hostSocketId = null;
let rounds = [];
let players = new Map(); // socket.id -> {name, score}
let currentRoundIndex = 0;
let visible = 0;
let roundAuthor = '';
const basePoints = 5;
const stepPoints = 1;

io.on('connection', (socket) => {
  console.log('client connected');

  socket.on('join', (name) => {
    const clean = name.trim();

    // Reject if ANY existing player already has this (case-insensitive) name
    const taken = [...players.values()].some(
      (p) => p.name.toLowerCase() === clean.toLowerCase()
    );
    if (taken) {
      socket.emit('nameTaken');
      return;
    }

    players.set(socket.id, { name: clean, score: 0 });

      if (inGame) {
        socket.emit('gameInProgress');
      }
    
      io.emit('scoreUpdate', Array.from(players.values()));
  });

  socket.on('startGame', () => {
    if (inGame) return;
    if (players.size < 2) {
      socket.emit('notEnoughPlayers');
      return;
    }
    hostSocketId = socket.id;
    socket.emit('hostAssigned');
    inGame = true;
    rounds = pickRounds(csvRows, 10);
    runGame();
  });

  socket.on('guess', ({ round, guess }) => {
    if (!inGame || round - 1 !== currentRoundIndex) return;
    const player = players.get(socket.id);
    if (!player) return;

    // Already guessed this round? Ignore.
    if (player.guessedRound?.includes(round)) return;

    // First guess for this round → lock them out
    player.guessedRound = [...(player.guessedRound || []), round];

    // Award points only if correct
    const correct = guess === roundAuthor;
    if (correct) {
      const points = scoreGuess(basePoints, stepPoints, visible);
      player.score += points;
    }

    // broadcast individual result so UIs can colour things
    io.emit('guessResult', {
      playerId: socket.id,
      name: player.name,
      correct,
    });

    // Broadcast leaderboard (even if no points, so UI can show who has guessed)
    io.emit(
      'scoreUpdate',
      Array.from(players.values()).sort((a, b) => b.score - a.score)
    );
  });

  
socket.on('cancelGame', () => {
  if (socket.id !== hostSocketId || !inGame) return;
  inGame = false;
  io.emit('gameCancelled');
});

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('scoreUpdate', Array.from(players.values()));
  });
});

async function runGame() {
  const revealDelay = 5000;   // 5 s between hints
  for (currentRoundIndex = 0; currentRoundIndex < rounds.length && inGame; currentRoundIndex++) {
    const round = rounds[currentRoundIndex];
    roundAuthor = round.author;
    visible = 0;
    const authors = [...new Set(rounds.map((r) => r.author))];
    io.emit('roundStart', {
      round: currentRoundIndex + 1,
      messages: round.messages,
      authors,
      leaderboard: Array.from(players.values()),
      revealDelay,
      phaseStart: Date.now(),
      hostId: hostSocketId,
    });

    while (visible < 5 && inGame) {
      await delay(revealDelay);
      visible++;
      io.emit('revealNext', {
        visible,
        revealDelay,
        phaseStart: Date.now(),
      });
    }
    if (!inGame) break;
    // await delay(3000); // 3 s pause between rounds
  }
  if (!inGame) return;
  const ranking = Array.from(players.values()).sort((a, b) => b.score - a.score);
  io.emit('gameOver', ranking);
  // reset scores for next game
  players.forEach((p) => (p.score = 0));

  inGame = false;          // <── allow a brand-new game
  hostSocketId = null;     // (next "Start" click will set a new host)
  rounds = [];             // optional: clear round cache
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
