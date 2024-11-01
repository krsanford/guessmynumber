const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
  const { gameId, guestName, guessNumber } = req.body;

  if (!gameId || !guestName || guessNumber == null) {
    context.res = {
      status: 400,
      body: { error: 'Invalid input data.' }
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
      throw new Error('Game is not open for guesses.');
    }

    // Check if the guest has already submitted a guess
    if (game.guesses.some(guess => guess.guestName === guestName)) {
      throw new Error('You have already submitted a guess.');
    }

    // Add the new guess
    game.guesses.push({
      guestName,
      guessNumber,
      submittedAt: new Date().toISOString()
    });

    // Update the game
    await container.item(gameId, gameId).replace(game);

    context.res = {
      status: 200,
      body: { message: 'Guess submitted successfully.' }
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: { error: error.message }
    };
  }
};
