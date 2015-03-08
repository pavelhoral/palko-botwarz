var _ = require('lodash');

var calc = {};

/**
 * Get angle of the vector.
 */
calc.atan = function(dx, dy) {
    return Math.atan2(dy, dx) * 180 / Math.PI;
};

/**
 * Calculate next bot position.
 */
calc.next = function(bot, time) {
    if (!time) {
        time = 0.2;
    }
    if (!bot.nx) {
        bot.nx = Math.cos(bot.angle * Math.PI / 180) * bot.speed * time + bot.x;
    }
    if (!bot.ny) {
        bot.ny = Math.sin(bot.angle * Math.PI / 180) * bot.speed * time + bot.y;
    }
    return bot;
};

/**
 * Calculate relative properties of `other` bot in relation to the given `bot`.
 */
calc.relative = function(bot, other) {
    var stats = _.extend({}, calc.next(other));
    stats.distance = Math.sqrt(Math.pow(bot.x - other.x, 2) + Math.pow(bot.y - other.y, 2));
    stats.direction = this.atan(other.x - bot.x, other.y - bot.y);
    stats.ndistance = Math.sqrt(Math.pow(bot.nx - other.nx, 2) + Math.pow(bot.ny - other.ny, 2));
    stats.ndirection = this.atan(other.nx - bot.nx, other.ny - bot.ny);
    return stats;
};

/**
 * Get steering angle between a source `angle` and a `target` angle.
 */
calc.steer = function(angle, target) {
    var right = (target - angle + 360) % 360,
        left = (angle - target + 360) % 360,
        clockwise = left == right ? Math.random() < 0.5 : right < left;
    return Math.round(clockwise ? right : -left);
};

/**
 * Get angle difference for steering to the defined `target` angle.
 */
calc.angle = function(angle, target) {
    return Math.min((angle - target + 720) % 360, (target - angle + 720) % 360);
};

/**
 * Get angle difference for steering to the opposite direction from the defined `target` angle.
 */
calc.rangle = function(angle, target) {
    return this.steer(angle, target + 180);
};

module.exports = calc;
