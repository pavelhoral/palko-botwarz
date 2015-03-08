var client = require('./client/client.js'),
    Swarm = require('./logic/swarm.js'),
    Game = require('./game/game.js');

var Main = function(client, data) {

    this.game = game = new Game(client.config().nickname, data);

    var swarm = null,
        timer = null;

    var last = null;

    var onUpdate = function(data) {
        game.updateGame(data);
        if (last && data.lastCmdId === last.cmdId && !last.timer) {
            // We need to wait
            last.timer = setTimeout(function() {
                last.confirmed = true;
                onPlay();
            }, 201);
        } else if (!last || last.confirmed) {
            // We can play
            onPlay();
        }
    };

    var onPlay = function() {
        if (!swarm) {
            swarm = new Swarm(game);
        }
        if (!game.getPlayerBots(false).length) {
            return;
        }
        var commands =  swarm.getCommands();
        if (commands.length) {
            console.log('### ' + JSON.stringify(swarm.getState()));
            last = { cmdId: last ? last.cmdId + 1 : 1, bots: commands };
            client.write(last);
        }
    };

    client.on('update', onUpdate);
    this.destroy = function() {
        client.removeListener('update', onUpdate);
        if (last && last.timer) {
            clearTimeout(last.timer);
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
    process.exit();
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
