var _ = require('lodash');

var DEFAULT_CYCLE_DURATION = 0.2,
    calc = {};

/**
 * Get angle of the vector.
 */
calc.atan = function(dx, dy) {
    return Math.atan2(dy, dx) * 180 / Math.PI;
};

/**
 * Calculate next bot position.
 */
calc.next = function(bot, duration) {
    if (!duration) {
        duration = DEFAULT_CYCLE_DURATION;
    }
    if (!bot.nx) {
        bot.nx = Math.cos(bot.angle * Math.PI / 180) * bot.speed * duration + bot.x;
    }
    if (!bot.ny) {
        bot.ny = Math.sin(bot.angle * Math.PI / 180) * bot.speed * duration + bot.y;
    }
    return bot;
};

/**
 * Calculate number of cycles to travel the specified `distance` at the given `speed`.
 */
calc.cycles = function(distance, speed, duration) {
    if (!duration) {
        duration = DEFAULT_CYCLE_DURATION;
    }
    return distance / speed /  duration;
};

/**
 * Calculate relative properties of `other` bot in relation to the given `bot`.
 */
calc.relative = function(bot, other, game) {
    var stats = _.extend({}, calc.next(other));
    stats.distance = Math.sqrt(Math.pow(bot.x - other.x, 2) + Math.pow(bot.y - other.y, 2));
    stats.direction = this.atan(other.x - bot.x, other.y - bot.y);
    stats.ndistance = Math.sqrt(Math.pow(bot.nx - other.nx, 2) + Math.pow(bot.ny - other.ny, 2));
    stats.ndirection = this.atan(other.nx - bot.nx, other.ny - bot.ny);
    stats.arrivet = calc.cycles(stats.distance - game.getBotRadius() * 2, bot.speed);
    stats.rarrivet = calc.cycles(stats.distance - game.getBotRadius() * 2, other.speed);
    stats.steer = calc.steer(bot.angle, stats.direction);
    stats.steert = calc.cycles(calc.angle(bot.angle, stats.direction), bot.rspeed, 1);
    stats.rsteert = calc.cycles(calc.rangle(other.angle, stats.direction), other.rspeed, 1);
    return stats;
};

/**
 * Get steering angle between a source `angle` and a `target` angle.
 */
calc.steer = function(angle, target) {
    var right = (target - angle + 360) % 360,
        left = (angle - target + 360) % 360,
        clockwise = right < left;
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
