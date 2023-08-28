const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuidv4 = require('uuid').v4;
const { createClient } = require('redis');
require('dotenv').config();

// Make interval function accessible globally so that we can reuse it for the 'correct word' function

// Spinning the http server, the WebSocket server, and initiating Redis.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 3080;
const words = ['Banana','Whisper','Sunshine','Puzzle','Cookie','Tornado','Unicorn','Jazz','Moonlight','Giggles','Backpack','Secret','Dinosaur','Bubbles','Enchanted','Magic','Pancake','Flamingo','Pineapple']
const redis = createClient({
  url: process.env.REDIS_CONNECTION_URL
});
console.log('redis: ', redis);
redis.on('error', err => console.log('Redis Client Error', err));
server.listen(port, async () => {
  await redis.connect();
  console.log(`WebSocket server is running on port ${port}`);
});

const clients = {}; // I'm maintaining all active connections in this object
const users = {}; // maintaining all active users in this object

let currentGameRoom = '';
let currentGameData = {};

let currentGame = {
  users: [],
  ongoing: false,
  guesser: null,
  guesses: 0,
  password: ''
}

let currentTimer = '';

function broadcastMessage(json) {
  const data = JSON.stringify(json);
  for(let userId in clients) {
    let client = clients[userId];
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  };
}

async function handleMessage(message, userId) {
  const dataFromClient = JSON.parse(message.toString());
  console.log('dataFromClient: ', dataFromClient)
  const json = { type: dataFromClient.type };
  switch (dataFromClient.type) {
    case 'endgame':
      console.log('datafromclient: ', dataFromClient);
    case 'newguess':
      currentGame.guesses++;
      broadcastMessage({type: 'setguesses', currentGame});
      break;
    case 'newround':
      let previousGuesser = currentGame.guesser;
      currentGame.guesses = 0;
      currentGame.users.forEach( e => {
        if (e !== previousGuesser) {
          currentGame.guesser = e;
        }
      });
      broadcastMessage({type: 'setguesser', currentGame});
      broadcastMessage({type: 'setguesses', currentGame});
      let word = words[Math.floor(Math.random() * words.length)];
      currentGame.password = word;
      broadcastMessage({type: 'setpassword', currentGame});
      currentGame.ongoing = true;

        var time = 60;
        const timer = () => {
            let min = Math.floor(time / 60);
            let sec = time % 60;
            broadcastMessage({type: 'timerevent', data: `${min}:${sec}`});
            time--;
            if (min == 0 && sec == 0) {
              clearInterval(currentTimer);
              broadcastMessage({type: 'gameevent', currentGame, message: 'endround'});
              currentGame.ongoing = false;
              currentGameData.roundsPlayed++;
              currentGameData.users[currentGame.guesser].points += 10 - (currentGame.guesses * 2);
              broadcastMessage({type: 'scores', data: currentGameData.users});

              redis.json.set(currentGameRoom, `.`, currentGameData)
            }
        }
        currentTimer = setInterval(timer, 1000);

      break;
    case 'userevent':
      users[dataFromClient.users[0][0]] = dataFromClient.users[0];
      currentGame.users.push(dataFromClient.users[0][0]);
      json.data = { users, currentGame };
      if (currentGame.users.length === 2 && !currentGame.ongoing) {
        // SET GAME ROOM ID
        let roomId = Math.floor(Math.random() * (1000 - 1) + 1);
        let gameRoom = `game-${roomId}`;
        currentGameRoom = gameRoom;
        let gameRoomData =  {
            users: {
              [currentGame.users[0]]: {
                points: 0
              },
              [currentGame.users[1]]: {
                points: 0
              },
            },
          roundsPlayed: 0
        }
        let existingGame = await redis.get(`${gameRoom}`);
        if (existingGame !== null) {
          await redis.json.set(gameRoom, `.`, gameRoomData);
        } else {
          await redis.json.set(gameRoom, `$`, {});
          await redis.json.set(gameRoom, `.`, gameRoomData);
          currentGameData = {...gameRoomData};
        }
        await redis.json.set(gameRoom, `.`, gameRoomData);
        let guesser = Math.round(Math.random()); // RANDOMIZE A GUESSER
        let word = words[Math.floor(Math.random() * words.length)];
        currentGame.password = word;
        currentGame.guesser = currentGame.users[guesser];
        broadcastMessage({type: 'setpassword', currentGame});
        currentGame.ongoing = true;
          var time = 60;
          const timer = () => {
              let min = Math.floor(time / 60);
              let sec = time % 60;
              broadcastMessage({type: 'timerevent', data: `${min}:${sec}`});
              time--;
              if (min == 0 && sec == 0) {
                clearInterval(currentTimer);
                broadcastMessage({type: 'gameevent', currentGame, message: 'endround'});
                currentGame.ongoing = false;
                gameRoomData.roundsPlayed++;
                currentGameData.roundsPlayed++;
                currentGameData.users[currentGame.guesser].points += 10 - (currentGame.guesses * 2);
                broadcastMessage({type: 'scores', data: currentGameData.users});
                redis.json.set(gameRoom, `.`, currentGameData);
              }
          }
        currentTimer = setInterval(timer, 1000);

        broadcastMessage({type: 'setguesser', currentGame});
      }
      broadcastMessage(json);
      break;
    case 'correctword':
      clearInterval(currentTimer);
      currentGameData.roundsPlayed++;
      currentGameData.users[currentGame.guesser].points += 10 - (currentGame.guesses * 2);
      broadcastMessage({type: 'scores', data: currentGameData.users});
      broadcastMessage({type: 'gameevent', currentGame, message: 'endround'});
      broadcastMessage({type: 'timerevent', data: `0:0`});
      console.log('currentGameRoom: ', currentGameRoom);
      redis.json.set(currentGameRoom, `.`, currentGameData);
      break;
    case 'contentchange':
      editorContent = dataFromClient.content;
      json.data = { editorContent, userActivity };
      broadcastMessage(json);
      break;
  }
}

function handleDisconnect(userId) {
    console.log(`${userId} disconnected.`);
    const json = { type: 'userevent' };
    const username = users[userId]?.username || userId;
    json.data = { users };
    delete clients[userId];
    delete users[userId];
    broadcastMessage(json);
}

// A new client connection request received
wsServer.on('connection', function(connection) {
  const userId = uuidv4();
  console.log('Recieved a new connection');

  // Store the new connection and handle messages
  clients[userId] = connection;
  console.log(`${userId} connected.`);
  connection.on('message', (message) => {
    console.log('message: ', );
    handleMessage(message, userId)
  });
  // User disconnected
  connection.on('close', () => handleDisconnect(userId));
});
