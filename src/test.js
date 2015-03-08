var data = {
    world: {
        width: 900,
        height: 600
    },
    speedLevels: [
        { speed: 10, maxAngle: 30 },
        { speed: 30, maxAngle: 15 },
        { speed: 90, maxAngle: 10 },
        { speed: 180, maxAngle: 5 },
        { speed: 360, maxAngle: 2 }
    ],
    botRadius: 20,
    players: [
        {
            nickname: "palko",
            bots: [
                { id: 'f1', x: 0, y: 0, angle: 0, speed: 0 }
            ]
        },
        {
            nickname: "enemy",
            bots: [
                { id: 'e1', x: 100, y: 100, angle: 0, speed: 0 },
                { id: 'e2', x: 50, y: 50, angle: 0, speed: 0 },
                { id: 'e3', x: 100, y: 100, angle: 0, speed: 0 }
            ]
        }
    ]
};

// Create game
var game = new (require('./game/game.js'))('palko', data);

// Create update
var update = new (require('./game/update.js'))(
    data
).filter(['f1', 'e1']);

// Update game
game.updateGame(update.data);

// Process swarm
var swarm = new (require('./logic/swarm.js'))(game),
    commands = swarm.getCommands();

console.log('SCORE', require('util').inspect(swarm.getScore(), false, 4));
console.log('COMMANDS', commands);
console.log('STATE', swarm.getState());
