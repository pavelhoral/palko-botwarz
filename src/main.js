var client = require('./client/client.js'),
    Swarm = require('./logic/swarm.js'),
    Game = require('./game/game.js');

var Main = function(client, data) {

    this.game = game = new Game(client.config().nickname, data);

    var swarm = null,
        lastId = -1,
        timer = null;

    var onUpdate = function(data) {
        game.updateGame(data);
        if (lastId !== (data.lastCmdId || 0)) {
            lastId = data.lastCmdId || 0;
            setTimeout(onPlay, 205);
        }
    };

    var onPlay = function() {
        if (!swarm) {
            swarm = new Swarm(game);
        }
        if (game.getPlayerBots(false).length) {
            var commands =  swarm.getCommands();
            console.log('### ' + JSON.stringify(swarm.getState()));
            client.write({ cmdId: lastId + 1, bots: commands });
        }
    };

    client.on('update', onUpdate);
    this.destroy = function() {
        client.removeListener('update', onUpdate);
        if (timer) {
            clearTimeout(timer);
        }
    };

};

var main = null;

try {
    client.config(require('./config.json'));
} catch (e) {
    console.error('ERROR Unable to load `config.json`.', e);
}

/**
 * Game start && end.
 */
client.on('start', function(data) {
    if (main) {
        main.destroy();
    }
    main = new Main(client, data);
});
client.on('result', function(data) {
    var players = main.game.getPlayerIds(),
        winner = data.winner ? data.winner.nickname : null,
        looser = winner ? players[(players.indexOf(winner) + 1) % 2] : null;
    var status = 'Draw between \'' + players[0] + '\' and \'' + players[1] + '\'.';
    if (winner) {
        status = 'Winner \'' + winner + '\', looser \'' + looser + '\'.';
    }
    console.log('\nThe fight is over! ' +  status + '\n');
//    process.exit();
});

/**
 * Message logging.
 */
client.on('request', function(request) {
    console.log('<<< ' + new Date().toISOString() + ' ' + request);
});
client.on('response', function(response) {
    console.log('>>> ' + new Date().toISOString() + ' ' + JSON.stringify(response));
});
client.on('error', function(error) {
    console.error('ERROR', error);
});

client.connect();
