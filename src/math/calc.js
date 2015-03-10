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
calc.next = function(bot) {
    if (!bot.nx) {
        bot.nx = Math.cos(bot.angle * Math.PI / 180) * bot.speed * DEFAULT_CYCLE_DURATION + bot.x;
    }
    if (!bot.ny) {
        bot.ny = Math.sin(bot.angle * Math.PI / 180) * bot.speed * DEFAULT_CYCLE_DURATION + bot.y;
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
    return Math.abs(distance) / speed / duration;
};

/**
 * Calculate relative properties of `other` bot in relation to the given `bot`.
 */
calc.relative = function(bot, other, game) {
    var stats = _.extend({}, calc.next(other));
    // Current distance and direction
    stats.distance = Math.sqrt(Math.pow(bot.x - other.x, 2) + Math.pow(bot.y - other.y, 2));
    stats.direction = this.atan(other.x - bot.x, other.y - bot.y);
    // Distance and direction next cycle
    stats.ndistance = Math.sqrt(Math.pow(bot.nx - other.nx, 2) + Math.pow(bot.ny - other.ny, 2));
    stats.ndirection = this.atan(other.nx - bot.nx, other.ny - bot.ny);
    // Number of cycles before collision
    stats.arrivet = calc.cycles(stats.distance - game.getBotRadius() * 2, bot.speed);
    stats.rarrivet = calc.cycles(stats.distance - game.getBotRadius() * 2, other.speed);
    // Steering deviation
    stats.steerd = calc.steerd(stats.distance, game);
    stats.nsteerd = calc.steerd(stats.ndistance, game);
    // Steering angles
    stats.steer = calc.steer(bot.angle, stats.direction);
    stats.steerm = calc.sign(stats.steer) * Math.max(Math.abs(stats.steer) - stats.steerd, 0);
    stats.rsteer = calc.rsteer(other.angle, stats.direction);
    stats.rsteerm = calc.sign(stats.rsteer) * Math.max(Math.abs(stats.rsteer) - stats.steerd, 0);
    // Steering angles for next cycle
    stats.nsteer = calc.steer(bot.angle, stats.ndirection);
    stats.nsteerm = calc.sign(stats.nsteer) * Math.max(Math.abs(stats.nsteer) - stats.nsteerd, 0);
    stats.nrsteer = calc.rsteer(other.angle, stats.ndirection);
    stats.nrsteerm = calc.sign(stats.nrsteer) * Math.max(Math.abs(stats.nrsteer) - stats.nsteerd, 0);
    // Number of cycles to steer
    stats.steert = calc.cycles(Math.abs(stats.steerm), bot.sspeed, 1);
    stats.nsteert = calc.cycles(Math.abs(stats.nsteerm), bot.sspeed, 1);
    stats.rsteert = calc.cycles(Math.abs(stats.rsteerm), other.sspeed, 1);
    stats.nrsteert = calc.cycles(Math.abs(stats.nrsteerm), other.sspeed, 1);
    return stats;
};

/**
 * Get steering angle deviation based on the blade size (90 deg) and bot distance.
 */
calc.steerd = function(distance, game) {
    return Math.atan((Math.sqrt(2) * game.getBotRadius() + game.getBotRadius()) / (2 * distance)) * 180 / Math.PI;
};

/**
 * Get steering angle between a source `angle` and a `target` angle.
 */
calc.steer = function(angle, target) {
    var right = (target - angle + 360) % 360,
        left = (angle - target + 360) % 360;
    return Math.round(right < left ? right : -left);
};

/**
 * Simple signum function.
 */
calc.sign = function(value) {
    return value < 0 ? -1 : 1;
};

/**
 * Get angle difference for steering to the opposite direction from the defined `target` angle.
 */
calc.rsteer = function(angle, target) {
    return this.steer(angle, target + 180);
};

module.exports = calc;
