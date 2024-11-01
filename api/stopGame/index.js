const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
  const { gameId } = req.body;

  if (!gameId) {
    context.res = {
      status: 400,
      body: { error: 'Game ID is required.' }
    };
    return;
  }

  const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
  const container = client.database('GuessMyNumberDB').container('Games');

  try {
    // Fetch the game
    const { resource: game } = await container.item(gameId, gameId).read();

    if (!game) {
      throw new Error('Game not found.');
    }

    if (game.status !== 'open') {
      throw new Error('Game is already closed.');
    }

    game.status = 'closed';

    const targetNumber = game.targetNumber;
    const gameMode = game.gameMode;

    // Calculate results
    let results = game.guesses.map(guess => ({
      guestName: guess.guestName,
      guessNumber: guess.guessNumber,
      difference: Math.abs(targetNumber - guess.guessNumber),
      over: guess.guessNumber > targetNumber
    }));

    if (gameMode === 'closest_without_over') {
      results = results.filter(result => !result.over);
    }

    results.sort((a, b) => a.difference - b.difference);

    // Update the game with results
    game.results = results.slice(0, 10);

    // Save the updated game
    await container.item(gameId, gameId).replace(game);

    context.res = {
      status: 200,
      body: { results: game.results }
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: { error: error.message }
    };
  }
};
