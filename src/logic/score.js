var _ = require('lodash'),
    calc = require('../math/calc.js');

var types = {};

/**
 * ATTACK score.
 */
types.attack = function(bot, other, game) {
    var result = {
        score: 1000 / other.ndistance,
        ram: false
    };
    if (Math.abs(other.steerm) < 10) {
        // We can RAM the enemy
        result.score *= 2;
        if (Math.abs(other.steerm) === 0) {
            // We are looking right at him
            result.ram = true;
        }
        if (Math.abs(other.rsteerm) > 30) {
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
        score: 1000 / Math.max(other.ndistance, 1),
        run: false
    };
    if (other.ndistance < 50 && Math.abs(other.rsteert) < 3) {
        // He is almost looking our way
        result.score *= 2;
    }
    if (other.ndistance < 200 && Math.floor(Math.abs(other.rsteert)) <= 1) {
        // He can RAM us
        result.score *= 2;
        if (Math.abs(other.steert) > 1 && other.rsteert == 0) {
            // He is aiming directly at us
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
    if (other.distance < 80 && (other.nrsteerm == 0 || other.rsteerm == 0)) {
        // He is going for us
        result.score = 1000 / other.ndistance;
        if (other.steert > other.arrivet) {
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
    if (other.distance < 200 && (other.steerm == 0 || other.nsteerm == 0)) {
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
