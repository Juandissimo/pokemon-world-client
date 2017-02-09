(function ($) {

	var LadderRoom = this.LadderRoom = this.Room.extend({
		type: 'ladder',
		title: 'Ladder',
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			app.on('init:formats', this.update, this);
			this.update();
			app.on('response:laddertop', function (data) {
				var buf = '<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i><p><strong style="color:blue">Format List</button></p>';
				if (!data) {
					this.$el.html(buf + '<p>error</p></div>');
					return;
				}
				if (this.curFormat !== data[0]) return;
				buf += Tools.sanitizeHTML(data[1]) + '</div>';
				this.$el.html(buf);
			}, this);
		},
		curFormat: '',
		update: function () {
			if (!this.curFormat) {
				var buf = '<div class="ladder pad"><p>Check leaderboards ranks <code> /ranking <em>username</em></code></p>' +
					//'<p><strong style="color:black">We will not reset the leaderboards. unless its highly needed</strong></p>' +
					'<p><p><strong style="color:black">All leaderboards!</p>' +
					'<p><button name="selectFormat" value="help" class="button"><i class="fa fa-info-circle"></i><img src="http://pokemon-online.eu/images/pokemon/x-y/animated/379.gif" class="bbCodeImage LbImage" alt="[&#x200B;IMG]" data-url="http://pokemon-online.eu/images/pokemon/x-y/animated/379.gif" /></button></p><ul>';
				if (!window.BattleFormats) {
					this.$el.html('<div class="pad"><em><p><strong style="color:black">Connecting...</em></div>');
					return;
				}
				var curSection = '';
				for (var i in BattleFormats) {
					var format = BattleFormats[i];
					if (format.section && format.section !== curSection) {
						curSection = format.section;
						buf += '</ul><h3>' + Tools.escapeHTML(curSection) + '</h3><ul style="list-style:none;margin:0;padding:0">';
					}
					if (!format.searchShow || !format.rated) continue;
					buf += '<li style="margin:5px"><button name="selectFormat" value="' + i + '" class="button" style="width:320px;height:30px;text-align:left;font:12pt Verdana">' + Tools.escapeFormat(format.id) + '</button></li>';
				}
				buf += '</ul></div>';
				this.$el.html(buf);
			} else if (this.curFormat === 'help') {
				this.showHelp();
			} else {
				var format = this.curFormat;
				var self = this;
				this.$el.html('<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i><p><strong style="color:black">Format List</button></p><p><em>Reloading...</em></p></div>');
				if (app.localLadder) {
					app.send('/cmd laddertop ' + format);
				} else {
					$.get('/ladder.php', {
						format: format,
						server: Config.server.id.split(':')[0],
						output: 'html'
					}, function (data) {
						if (self.curFormat !== format) return;
						var buf = '<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i><p><strong style="color:black">Format List</button></p>';
						buf += '<h3>' + Tools.escapeFormat(format) + '<strong style="color:blue"> Top 500</h3>';
						buf += data + '</div>';
						self.$el.html(buf);
					}, 'html');
				}
			}
		},
		showHelp: function () {
			var buf = '<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i> Format List</button></p>';
			buf += '<h3><p><strong style="color:purple">How the ladder works</h3>';
			buf += '<p>Ratings System: Elo, GXE, Glicko-1, and COIL.</p>';
			buf += '<p><strong>Elo</strong> is the main ladder rating.</p>';
			buf += '<p><strong>GXE</strong> (Glicko X-Act Estimate) is an estimate of your win chance against an average ladder player.</p>';
			buf += '<p><strong>Glicko-1</strong> is a different rating system. It has rating and deviation values.</p>';
			buf += '<p><strong>COIL</strong> (Converging Order Invariant Ladder) is mainly used for suspect tests. It goes up as you play games, but not too many games.</p>';
			buf += '<p>Note that win/loss should not be used to estimate skill, since who you play against is much more important than how many times you win or lose. Our other stats like Elo and GXE are much better for estimating skill.</p>';
			buf += '</div>';
			this.$el.html(buf);
		},
		selectFormat: function (format) {
			this.curFormat = format;
			this.update();
		}
	}, {
		COIL_B: {
			'oususpecttest': 17,
			'uberssuspecttest': 29,
			'uususpecttest': 20,
			'rususpecttest': 11,
			'nususpecttest': 9,
			'pususpecttest': 9,
			'lcsuspecttest': 9,
			'doublesoususpecttest': 14.5
		}
	});

}).call(this, jQuery);
