var Update = function(data) {

    this.data = data;

    this.filter = function(ids) {
        data.players.forEach(function(player) {
            var bots = player.bots.filter(function(bot) {
                return ids.indexOf(bot.id) >= 0;
            });
            player.bots = bots;
        });
        return this;
    };

};

module.exports = Update;
