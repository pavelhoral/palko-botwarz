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

var game = new (require('./game/game.js'))('palko', data);
game.updateGame(data);

var swarm = new (require('./logic/swarm.js'))(game);

console.log(swarm.getCommands());
console.log(swarm.getState());
