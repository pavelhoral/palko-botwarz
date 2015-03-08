var _ = require('lodash'),
    calc = require('../math/calc.js');

var types = {};

/**
 * ATTACK score.
 */
types.attack = function(bot, other) {
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
types.defend = function(bot, other) {
    var result = {
        score: 1000 / Math.max(other.ndistance, 1),
        run: false
    };
    if (other.distance < 50) {
        if (calc.rangle(other.angle, other.direction) < 90) {
            // He is almost looking our way
            result += 500;
        }
        if (calc.angle(bot.angle, other.direction) > calc.rangle(other.angle, other.direction) + 15) {
            // Try to RUN as he can turn much faster
            result += 1000;
            result.run = true;
        }
        return result;
    }
    if (other.distance < 120 && calc.rangle(other.angle, other.direction) < 20) {
        // He can RAM us
        result.score += 500;
        if (calc.angle(bot.angle, other.direction) > 90 && other.speed > 10) {
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
types.dodge = function(bot, other) {
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
types.avoid = function(bot, other) {
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

var create = function(type, bot, others) {
    var result = [];
    others.forEach(function(other) {
        result.push(_.extend({}, other, types[type](bot, other)));
    });
    return sort(result);
};

module.exports = function(bot, allies, enemies) {
    allies = allies.filter(function(other) {
        return other.id != bot.id;
    }).map(function(other) {
        return calc.relative(bot, other);
    });
    enemies = enemies.map(function(other) {
        return calc.relative(bot, other);
    });
    return {
        attack: create('attack', bot, enemies),
        defend: create('defend', bot, enemies),
        dodge: create('dodge', bot, allies),
        avoid: create('avoid', bot, allies),
    };
};
