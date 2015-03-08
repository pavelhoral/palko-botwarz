var calc = require('../math/calc.js');

var Game = function(nickname, data) {

    var game = data,
        bots = {};

    this.updateGame = function(data) {
        bots = {};
        data.players.forEach(function(player) {
            player.bots.forEach(function(bot) {
                bot.enemy = player.nickname !== nickname;
                bots[bot.id] = calc.next(bot);
            });
        });
    };

    this.getPlayerIds = function() {
        return data.players.map(function(player) {
            return player.nickname;
        });
    };

    this.getPlayerBots = function(own) {
        var result = [];
        Object.keys(bots).forEach(function(id) {
            if (bots[id].enemy !== own) {
                result.push(bots[id]);
            }
        });
        return result;
    };

    this.getBotById = function(id) {
        return bots[id];
    };

    this.getSteerAngle = function(speed, angle) {
        var max = 0, abs = Math.abs(angle);
        game.speedLevels.forEach(function(level) {
            if (speed <= level.speed && max < level.maxAngle && max < abs) {
                max = Math.min(level.maxAngle, abs);
            }
        });
        return max * (angle < 0 ? -1 : 1);
    };

    this.isMaxSpeed = function(speed) {
        return game.speedLevels[game.speedLevels.length - 1].speed <= speed;
    };

    this.isMinSpeed = function(speed) {
        return game.speedLevels[0].speed >= speed;
    };

    this.isAtBoundary = function(bot) {
        return bot.x < 30 || bot.x > 870 || bot.y < 30 || bot.y > 570;
    };

};

module.exports = Game;

