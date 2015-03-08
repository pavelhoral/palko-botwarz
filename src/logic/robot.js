var calc = require('../math/calc.js'),
    score = require('./score.js');

/**
 * Call me Dave.
 */
var Robot = function(id, game) {

    this.data = game.getBotById(id);

    this.state = { nothing: 'just chillin\'' };

    this.score = {};

    this.getCommand = function() {
        this.data = game.getBotById(id);
        this.score = score(this.data, game.getPlayerBots(true), game.getPlayerBots(false));
        if (this.score.defend[0].score > this.score.attack[0].score) {
            this.state = { defence: this.score.attack[0].id };
            return this.defenceCommand();
        } else {
            this.state = { attack: this.score.defend[0].id };
            return this.attackCommand();
        }
    };

    this.defenceCommand = function() {
        if (this.score.dodge.length && this.score.dodge[0].run) {
            // We should get out of way
            this.state.dodge = this.score.dodge[0].id;
        }
        if (this.score.defend[0].run || this.state.dodge) {
            // We are supposed to RUN
            if (this.score.avoid.length) {
                // Blocked by ally, lets hope we will survive for next cycle
                this.state.blocked = this.score.avoid[0].id;
                return this.attackCommand();
            } else if (!game.isMaxSpeed(this.data.speed) && !game.isAtBoundary(this.data)) {
                // Lets RUN for our lives
                this.state.run = true;
                return { id: id, cmd: 'accelerate' };
            }
        }
        var angle = calc.steer(this.data.angle, this.score.defend[0].direction),
            steer = game.getSteerAngle(this.data.speed, angle);
        if (3 * Math.abs(steer) < Math.abs(angle) && !game.isMinSpeed(this.data.speed)) {
            // Slow down so that we can turn faster
            return { id: id, cmd: 'brake' };
        }
        // Turn head on towards enemy
        this.state.steer = angle;
        return { id: id, cmd: 'steer', angle: steer };
    };

    this.attackCommand = function() {
        if (this.score.avoid.length && this.score.avoid[0].distance < this.score.attack[0].distance) {
            // There is someone in between us and the enemy
            this.state = { avoid: this.score.avoid[0].id };
            if (game.isMinSpeed(this.data.speed)) {
                // We can no longer slow down, lets turn away
                if (Math.abs(this.score.defend[0].ndirection - this.score.avoid[0].direction) > 15) {
                    // Take defensive stance
                    this.state.defend = this.score.defend[0].id;
                    return { id: id, cmd: 'steer', angle: game.getSteerAngle(
                            calc.steer(this.data.anglue, this.score.defend[0].ndirection))};
                } else {
                    // Just turn away
                    return { id: id, cmd: 'steer', angle: game.getSteerAngle((Math.random() < 0.5 ? -1 : 1) * 90 )};
                }
            } else {
                // Slow down to prevent collision
                return { id: id, cmd: 'brake' };
            }
        }
        if (this.score.attack[0].ram && !game.isMaxSpeed(this.data.speed)) {
            // Let's RAM that bastart
            this.state.ram = true;
            return { id: id, cmd: 'accelerate' };
        }
        var angle = calc.steer(this.data.angle, this.score.attack[0].ndirection),
            steer = game.getSteerAngle(this.data.speed, angle);
        if (3 * Math.abs(steer) < Math.abs(angle) && !game.isMinSpeed(this.data.speed)) {
            // Slow down so that we can turn faster
            return { id: id, cmd: 'brake' };
        }
        // Turn head on towards enemy
        this.state.steer = angle;
        return { id: id, cmd: 'steer', angle: steer };
    };

};

module.exports = Robot;
