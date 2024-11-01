const apiUrl = '/api'; // Adjust if your API endpoint is different

let currentGameId = null;

// Create a new game
async function createGame() {
  const question = document.getElementById('question').value;
  const targetNumber = parseInt(document.getElementById('target-number').value);
  const gameMode = document.getElementById('game-mode').value;

  const response = await fetch(`${apiUrl}/createGame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question,
      targetNumber,
      gameMode
    })
  });

  const data = await response.json();

  if (response.ok) {
    currentGameId = data.gameId;
    alert('Game created! Share this Game ID with participants: ' + currentGameId);
    document.getElementById('admin-controls').style.display = 'block';
    document.getElementById('participant-section').style.display = 'none';
  } else {
    alert('Error creating game: ' + data.error);
  }
}

// Participants submit a guess
async function submitGuess() {
  const guestName = document.getElementById('guest-name').value;
  const guessNumber = parseInt(document.getElementById('guess-number').value);

  if (!currentGameId) {
    currentGameId = prompt('Enter the Game ID provided by the admin:');
  }

  const response = await fetch(`${apiUrl}/submitGuess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameId: currentGameId,
      guestName,
      guessNumber
    })
  });

  const data = await response.json();

  if (response.ok) {
    alert('Guess submitted successfully!');
  } else {
    alert('Error submitting guess: ' + data.error);
  }
}

// Admin stops the game and calculates results
async function stopGame() {
  const response = await fetch(`${apiUrl}/stopGame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameId: currentGameId
    })
  });

  const data = await response.json();

  if (response.ok) {
    displayResults(data.results);
  } else {
    alert('Error stopping game: ' + data.error);
  }
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h3>Top 10 Closest Guesses</h3>';
  results.forEach((result, index) => {
    resultsDiv.innerHTML += `<p>${index + 1}. ${result.guestName}: ${result.guessNumber}</p>`;
  });
}
