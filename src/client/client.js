var EventEmitter = require('events').EventEmitter,
    sha1sum = require('crypto').createHash('sha1'),
    carrier = require('carrier'),
    _ = require('lodash');

var eventEmitter = new EventEmitter(),
    clientSocket = null,
    clientConfig = {
        nickname: '-',
        token: '-'
    };

var responseBuffer = "";

var handleResponse = function(response) {
  try {
        var data = JSON.parse(response.toString().trim());
    } catch (e) {
        eventEmitter.emit('error', { data: response.toString(), error: e });
        return;
    }
    eventEmitter.emit('response', data);
    if (data.status === 'socket_connected') {
        eventEmitter.emit('login', data);
    } else if (data.play) {
        eventEmitter.emit('update', data.play);
    } else if (data.game) {
        eventEmitter.emit('start', data.game);
    } else if (data.result) {
        eventEmitter.emit('result', data.result);
    }
};

var gameClient = _.extend(eventEmitter, {

    config: function(config) {
        if (config) {
            _.extend(clientConfig, config);
        }
        return clientConfig;
    },

    write: function(command) {
        var data = JSON.stringify(command);
        eventEmitter.emit('request', data);
        clientSocket.write(data + '\n');
    },

    connect: function() {
        clientSocket = require('net').connect({
            host: clientConfig.host || 'botwarz.eset.com',
            port: clientConfig.port || 2000
        });
        carrier.carry(clientSocket, function(line) {
            handleResponse(line);
        });
    }

});

gameClient.on('login', function(challenge) {
    sha1sum.update(challenge.random + clientConfig.token);
    gameClient.write({
        login: {
            nickname: clientConfig.nickname,
            hash: sha1sum.digest('hex')
        }
    });
});

module.exports = gameClient;
