var _ = require('lodash'),
    calc = require('../math/calc.js');

var types = {};

/**
 * ATTACK score.
 */
types.attack = function(bot, other, game) {
    var result = {
        score: 1000 / other.distance,
        ram: false
    };
    if (calc.angle(bot.angle, other.direction) < 10) {
        // We can RAM the enemy
        result.ram = true;
        result.score *= 2;
        if (calc.rangle(other.angle, other.direction) > 45) {
            // He is even looking away
            result.score *= 2;
        }
    }
    return result;
};

/**
 * DEFEND score.
 */
types.defend = function(bot, other, game) {
    var result = {
        score: 1000 / Math.max(other.distance, 1),
        run: false
    };
    if (other.distance < 50) {
        if (other.rsteert <= 3) {
            // He is almost looking our way
            result.score *= 2;
        }
        if (Math.floor(other.steert) > Math.floor(other.rsteert) && Math.floor(other.steert) > 1) {
            // We better RUN as he can turn much faster
            result.score += 1000;
            result.run = true;
        }
        return result;
    }
    if (other.distance < 200 && Math.floor(other.rsteert) <= 1) {
        // He can RAM us
        result.score *= 2;
        if (other.steert >= 2 && Math.abs(other.steer) < 170) {
            // Try to RUN as we won't be able to turn in time
            result.score += 500;
            result.run = true;
        }
        return result;
    }
    return result;
};

/**
 * DODGE score.
 */
types.dodge = function(bot, other, game) {
    var result = {
        score: 0,
        run: false
    };
    if (other.distance < 80 && calc.rangle(other.angle, other.direction) < 20) {
        // He is going for us
        result.score = 1000 / other.ndistance;
        if (calc.angle(bot.angle, other.direction) > 60) {
            // Try to RUN as we might not be able to turn in time
            result.run = true;
        }
    }
    return result;
};

/**
 * AVOID score.
 */
types.avoid = function(bot, other, game) {
    var result = {
        score: 0
    };
    if (other.distance < 200 && calc.angle(bot.angle, other.direction) < 20) {
        // He is in our way
        result.score = 1000 / other.distance;
    }
    return result;
};

var sort = function(stats) {
    stats.sort(function(a, b) {
        return b.score - a.score;
    });
    return stats;
};

var create = function(type, bot, others, game) {
    var result = [];
    others.forEach(function(other) {
        var score = _.extend({}, other, types[type](bot, other));
        if (score.score > 0) {
            result.push(score);
        }
    });
    return sort(result);
};

module.exports = function(bot, allies, enemies, game) {
    allies = allies.filter(function(other) {
        return other.id != bot.id;
    }).map(function(other) {
        return calc.relative(bot, other, game);
    });
    enemies = enemies.map(function(other) {
        return calc.relative(bot, other, game);
    });
    return {
        attack: create('attack', bot, enemies, game),
        defend: create('defend', bot, enemies, game),
        dodge: create('dodge', bot, allies, game),
        avoid: create('avoid', bot, allies, game),
    };
};
