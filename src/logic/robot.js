var calc = require('../math/calc.js'),
    score = require('./score.js');

/**
 * Call me Dave.
 */
var Robot = function(id, game) {

    this.data = game.getBotById(id);

    this.state = { nothing: 'just chillin\'' };

    this.score = {};

    this.command = null;

    this.getCommand = function() {
        this.data = game.getBotById(id);
        this.score = score(this.data, game.getPlayerBots(true), game.getPlayerBots(false), game);
        this.command = null;
        if (this.score.dodge.length && this.score.dodge[0].run) {
            this.state.dodge = this.score.dodge[0].id;
            this.dodge(this.score.dodge[0]);
        }
        if (!this.command && this.score.defend[0].score > this.score.attack[0].score) {
            this.state = { defence: this.score.defend[0].id };
            this.defend();
        }
        if (!this.command && this.score.avoid.length) {
            this.state = { avoid: this.score.avoid[0].id };
            this.avoid();
        }
        if (!this.command) {
            this.state = { attack: this.score.attack[0].id };
            this.attack();
        }
        return this.command;
    };

    this.dodge = function(threat) {
        if (this.score.avoid.length) {
            // Blocked by ally, lets hope we will survive for next cycle
            this.state.blocked = this.score.avoid[0].id;
        } else if (!game.isMaxSpeed(this.data.speed) && !game.isAtBoundary(this.data)) {
            // Lets RUN for our lives
            this.state.run = true;
            this.command = { id: id, cmd: 'accelerate' };
        }
        return !!this.command;
    }

    this.defend = function() {
        if (this.score.defend[0].run && this.dodge(this.score.defend[0])) {
            // We are running
            return;
        }
        if (this.score.defend[0].rsteermt > 1 && this.score.defend[0].steermt > 4 && !game.isMinSpeed(this.data.speed)) {
            // Slow down so that we can turn faster
            this.command = { id: id, cmd: 'brake' };
        } else if (Math.floor(this.score.defend[0].steerm) != 0) {
            // Turn head on towards enemy
            this.state.steer = this.score.defend[0].steer;
            this.command = { id: id, cmd: 'steer', angle: game.getSteerAngle(this.data.speed, this.state.steer) };

        }
        return !!this.command;
    };

    this.avoid = function() {
        if (this.score.avoid[0].distance > this.score.attack[0].distance) {
            // There is enemy between me and the ally
            return false;
        }
        if (!game.isMinSpeed(this.data.speed)) {
            // Slow down to prevent collision
            this.command = { id: id, cmd: 'brake' };
        } else if (this.defend()) {
            // Take defensive stance
            return;
        } else {
            this.state.steer = 90 * this.score.avoid[0].steer / Math.abs(this.score.avoid[0].steer);
            return { id: id, cmd: 'steer', angle: game.getSteerAngle(this.data.speed, this.state.steer) };
        }
        return !!this.command;
    };

    this.attack = function() {
        if (this.score.attack[0].ram && !game.isMaxSpeed(this.data.speed)) {
            // Let's RAM that bastart
            this.state.ram = true;
            this.command = { id: id, cmd: 'accelerate' };
        } else if (Math.floor(this.score.attack[0].nsteermt) > 3 && !game.isMinSpeed(this.data.speed)) {
            // Slow down so that we can turn faster
            this.command = { id: id, cmd: 'brake' };
        } else {
            // Turn head on towards enemy
            this.state.steer = this.score.attack[0].nsteer;
            this.command = { id: id, cmd: 'steer', angle: game.getSteerAngle(this.data.speed, this.state.steer) };
        }
        return !!this.command;
    };

};

module.exports = Robot;
