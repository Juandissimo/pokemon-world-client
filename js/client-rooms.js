(function ($) {

	var RoomsRoom = this.RoomsRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'rooms',
		title: 'Rooms',
		isSideRoom: true,
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad">Main Server<button class="button" style="float:right;font-size:10pt;margin-top:3px" name="closeHide"><i class="fa fa-spin-right"></i> Close - Main Menu </button>';
			buf += '<div class="roomlisttop"><em style="font-size:16pt">Connecting...</div><div class="roomlist"><p><em style="font-size:20pt"></em></p></div><div class="roomlist"></div>';
			buf += '<p><button name="joinRoomPopup" class="button">Type a channel name</button></p></div>';
			this.$el.html(buf);
			app.on('response:rooms', this.update, this);
			app.send('/cmd rooms');
			app.user.on('change:named', this.updateUser, this);
			this.update();
		},
		updateUser: function () {
			this.update();
		},
		focus: function () {
			if (new Date().getTime() - this.lastUpdate > 60 * 1000) {
				app.send('/cmd rooms');
				this.lastUpdate = new Date().getTime();
			}
			var prevPos = this.$el.scrollTop();
			this.$('button[name=joinRoomPopup]').focus();
			this.$el.scrollTop(prevPos);
		},
		joinRoomPopup: function () {
			app.addPopupPrompt("Room name:", "Join room", function (room) {
				if (room.startsWith('http://')) room = room.slice(7);
				if (room.startsWith('https://')) room = room.slice(8);
				if (room.startsWith('main.pokemon-world.online/')) room = room.slice(25);
				if (room.startsWith('psim.online/')) room = room.slice(8);
				if (room.startsWith(document.location.hostname + '/')) room = room.slice(document.location.hostname.length + 1);
				room = toRoomid(room);
				if (!room) return;
				app.tryJoinRoom(room);
			});
		},
		update: function (rooms) {
			var firstOpen = !app.roomsData;
			if (rooms) {
				this.lastUpdate = new Date().getTime();
				app.roomsData = rooms;
			} else {
				rooms = app.roomsData;
			}
			if (!rooms) return;
			this.updateRoomList();
			if (!app.roomsFirstOpen && window.location.host !== 'main.psim.online') {
				if (Config.roomsFirstOpenScript) {
					Config.roomsFirstOpenScript();
				}
				app.roomsFirstOpen = 2;
			}
		},
		renderRoomBtn: function (roomData) {
			var id = toId(roomData.title);
			return '<div><a href="' + app.root + id + '" class="ilink"><small style="float:right">(' + Number(roomData.userCount) + ' users)</small><strong><i class="fa fa-comment-o"></i> ' + Tools.escapeHTML(roomData.title) + '<br /></strong><small>' + Tools.escapeHTML(roomData.desc || '') + '</small></a></div>';
		},
		compareRooms: function (roomA, roomB) {
			return roomB.userCount - roomA.userCount;
		},
		updateRoomList: function () {
			var rooms = app.roomsData;

			if (rooms.userCount) {
				var userCount = Number(rooms.userCount);
				var battleCount = Number(rooms.battleCount);
				var leftSide = '<button class="button" name="finduser" title="Find an online user"><strong>' + userCount + '</strong> ' + (userCount == 1 ? 'user' : 'users') + ' online</button>';
				var rightSide = '<button class="button" name="roomlist" title="Watch an active battle"><strong>' + battleCount + '</strong> active ' + (battleCount == 1 ? 'battle' : 'battles') + '</button>';
				this.$('.roomlisttop').html('<table class="roomcounters" border="2" cellspacing="2" cellpadding="2" width="100%"><tr><td>' + leftSide + '</td><td>' + rightSide + '</td></tr></table>');
			}
			this.$('.roomlist').first().html('<h2 class="rooms-officialchatrooms">Main Channels <img src="https://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif" width="100" height="100"></h2>' + _.map(rooms.official, this.renderRoomBtn).join(""));
			this.$('.roomlist').last().html('<h2 class="rooms-chatrooms">Side Channels <img src="https://img.pokemondb.net/sprites/black-white/anim/normal/flygon.gif" width="100" height="100"></h2>' + _.map(rooms.chat.sort(this.compareRooms), this.renderRoomBtn).join(""));
		},
		roomlist: function () {
			app.joinRoom('battles');
		},
		closeHide: function () {
			app.sideRoom = app.curSideRoom = null;
			this.close();
		},
		finduser: function () {
			if (app.isDisconnected) {
				app.addPopupMessage("You are offline.");
				return;
			}
			app.addPopupPrompt("Username", "Open", function (target) {
				if (!target) return;
				if (toId(target) === 'mayhem') {
					app.addPopup(Popup, {htmlMessage: "I am busy atm <a href=\"/help\"></a>?"});
					return;
				}
				app.addPopup(UserPopup, {name: target});
			});
		}
	});

	var BattlesRoom = this.BattlesRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'battles',
		title: 'Battles',
		isSideRoom: true,
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="close"><i class="fa fa-times"></i> Close</button><div class="roomlist"><p><button class="button" name="refresh"><i class="fa fa-refresh"></i> Refresh</button> <span style="' + Tools.getPokemonIcon('meloetta-pirouette') + ';display:inline-block;vertical-align:middle" class="picon" title=""></span></p>';

			buf += '<p><label class="label">Format:</label><button class="select formatselect" name="selectFormat">(All formats)</button></p>';
			buf += '<div class="list"><p>Connecting...</p></div>';
			buf += '</div></div>';

			this.$el.html(buf);
			this.$list = this.$('.list');

			this.format = '';
			app.on('response:roomlist', this.update, this);
			app.send('/cmd roomlist');
			this.update();
		},
		selectFormat: function (format, button) {
			if (!window.BattleFormats) {
				return;
			}
			var self = this;
			app.addPopup(FormatPopup, {format: format, sourceEl: button, selectType: 'watch', onselect: function (newFormat) {
				self.changeFormat(newFormat);
			}});
		},
		changeFormat: function (format) {
			this.format = format;
			app.send('/cmd roomlist ' + this.format);
			this.update();
		},
		focus: function (e) {
			if (e && $(e.target).closest('select, a').length) return;
			if (new Date().getTime() - this.lastUpdate > 60 * 1000) {
				app.send('/cmd roomlist');
				this.lastUpdate = new Date().getTime();
			}
			var prevPos = this.$el.scrollTop();
			this.$('button[name=refresh]').focus();
			this.$el.scrollTop(prevPos);
		},
		rejoin: function () {
			app.send('/cmd roomlist');
			this.lastUpdate = new Date().getTime();
		},
		renderRoomBtn: function (id, roomData, matches) {
			var format = (matches[1] || '');
			var formatBuf = '';
			if (roomData.minElo) formatBuf += '<small style="float:right">(' + (typeof roomData.minElo === 'number' ? 'rated: ' : '') + Tools.escapeHTML(roomData.minElo) + ')</small>';
			formatBuf += (format ? '<small>[' + Tools.escapeFormat(format) + ']</small><br />' : '');
			var roomDesc = formatBuf + '<em class="p1">' + Tools.escapeHTML(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + Tools.escapeHTML(roomData.p2) + '</em>';
			if (!roomData.p1) {
				matches = id.match(/[^0-9]([0-9]*)$/);
				roomDesc = formatBuf + 'empty room ' + matches[1];
			} else if (!roomData.p2) {
				roomDesc = formatBuf + '<em class="p1">' + Tools.escapeHTML(roomData.p1) + '</em>';
			}
			return '<div><a href="' + app.root + id + '" class="ilink">' + roomDesc + '</a></div>';
		},
		update: function (data) {
			if (!data && !this.data) {
				if (app.isDisconnected) {
					this.$list.html('<p>You are offline.</p>');
				} else {
					this.$list.html('<p>Connection...</p>');
				}
				return;
			}
			this.$('button[name=refresh]')[0].disabled = false;

			// Synchronize stored room data with incoming data
			if (data) this.data = data;
			var rooms = this.data.rooms;

			var buf = [];
			for (var id in rooms) {
				var roomData = rooms[id];
				var matches = ChatRoom.parseBattleID(id);
				// bogus room ID could be used to inject JavaScript
				if (!matches || this.format && matches[1] !== this.format) {
					continue;
				}
				buf.push(this.renderRoomBtn(id, roomData, matches));
			}

			if (!buf.length) return this.$list.html('<p> <img src="https://img.pokemondb.net/sprites/black-white/anim/normal/mew.gif" width="50" height="50"> No ' + Tools.escapeFormat(this.format) + ' battles are going on right now.</p>');
			return this.$list.html('<p>' + buf.length + (buf.length === 100 ? '+' : '') + ' ' + Tools.escapeFormat(this.format) + ' ' + (buf.length === 1 ? 'battle' : 'battles') + '</p>' + buf.join(""));
		},
		refresh: function (i, button) {
			app.send('/cmd roomlist ' + this.format);

			// Prevent further refreshes until we get a response.
			button.disabled = true;
		}
	});

}).call(this, jQuery);
