const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Explicit routes for the HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/player.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

let players = [];
let buzzerLocked = false;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.emit('update_players', players);

  socket.on('add_player', (playerInfo) => {
    players.push(playerInfo);
    io.emit('update_players', players); 
  });

  socket.on('update_scores', (updatedPlayers) => {
    players = updatedPlayers; 
    io.emit('update_players', players); 
  });

  socket.on('buzz', (playerId) => {
    if (!buzzerLocked) {
      buzzerLocked = true;
      io.emit('buzzer_winner', playerId); 
    }
  });

  socket.on('reset_buzzer', () => {
    buzzerLocked = false;
    io.emit('clear_buzzers'); 
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Game running on port ${PORT}`);
});
