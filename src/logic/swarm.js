var Robot = require('./robot.js');

var Swarm = function(game) {

    var robots = {};

    game.getPlayerBots(true).forEach(function(bot) {
        robots[bot.id] = new Robot(bot.id, game);
    });

    this.getCommands = function() {
        var commands = [];
        Object.keys(robots).forEach(function(id) {
            if (!game.getBotById(id)) {
                delete robots[id];
            }
        });
        Object.keys(robots).forEach(function(id) {
            var command = robots[id].getCommand();
            if (command) {
                commands.push(command);
            }
        });
        return commands;
    };

    this.getState = function() {
        var state = {};
        Object.keys(robots).forEach(function(id) {
            state[id] = robots[id].state
        });
        return state;
    };

};

module.exports = Swarm;