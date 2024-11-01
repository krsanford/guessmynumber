const { v4: uuidv4 } = require('uuid');
const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
  const { question, targetNumber, gameMode } = req.body;

  if (!question || targetNumber == null || !gameMode) {
    context.res = {
      status: 400,
      body: { error: 'Invalid input data.' }
    };
    return;
  }

  const gameId = uuidv4();
  const gameData = {
    id: gameId,
    question,
    targetNumber,
    gameMode,
    status: 'open',
    createdAt: new Date().toISOString(),
    guesses: []
  };

  const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
  const container = client.database('GuessMyNumberDB').container('Games');

  try {
    await container.items.create(gameData);

    context.res = {
      status: 200,
      body: { gameId }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
