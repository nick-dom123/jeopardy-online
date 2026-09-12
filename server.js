const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve the HTML files from the 'public' folder
app.use(express.static('public'));

let players = [];
let buzzerLocked = false;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send current players to whoever just joined
  socket.emit('update_players', players);

  // Host adds a new player
  socket.on('add_player', (playerInfo) => {
    players.push(playerInfo);
    io.emit('update_players', players); // Tell everyone
  });

  // Host updates the scores (NEW)
  socket.on('update_scores', (updatedPlayers) => {
    players = updatedPlayers; // Save the new scores to the server memory
    io.emit('update_players', players); // Blast the new scores out to the phones
  });

  // A player presses the buzzer
  socket.on('buzz', (playerId) => {
    if (!buzzerLocked) {
      buzzerLocked = true;
      io.emit('buzzer_winner', playerId); // Tell everyone who won
    }
  });

  // Host resets the buzzer for the next question
  socket.on('reset_buzzer', () => {
    buzzerLocked = false;
    io.emit('clear_buzzers'); // Tell phones to go back to normal
  });
});

http.listen(3000, () => {
  console.log('Game running at http://localhost:3000');
});