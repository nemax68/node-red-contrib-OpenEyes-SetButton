/*
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

 */

var PosixMQ = require('posix-mq');

module.exports = function (RED) {
	"use strict";

	function GuiSetButton(config) {
		RED.nodes.createNode(this,config);
		this.wsize = Number(config.wsize);
		this.hsize = Number(config.hsize);
		this.xpos = Number(config.xpos);
		this.ypos = Number(config.ypos);
		this.fontsize = Number(config.fontsize);
		this.bordersize = Number(config.bordersize);
		this.borderround = Number(config.borderround);
		this.bordercol = config.bordercol;
		this.fontcol = config.fontcol;
		this.maincol = config.maincol;
		this.gradcol = config.gradcol;
		this.bid = Number(config.bid);
		var posixmq = new PosixMQ();
		var node = this;
		var msg;
		var n;
		var send = false;

		posixmq.open({ name: '/gui_cmd',create: true,mode: '0777',maxmsgs: 10, msgsize: 256 });
		node.status({fill: "green", shape: "dot", text: 'link'});

		node.on('input', function(msg) {
			var str;
			var payload=msg.payload;
			var n;

			str = "BUTTON," + node.bid.toString() +
						"," + node.wsize +
						"," + node.hsize +
						"," + node.xpos +
 						"," + node.ypos +
 						"," + node.fontsize +
 						"," + node.fontcol +
 						"," + node.bordersize +
 						"," + node.borderround +
  						"," + node.bordercol +
 						"," + node.maincol +
 						"," + node.gradcol +
						"," + msg.payload.toString() + ",END";

			n = posixmq.push(str);
		});

		node.on('close', function() {
			posixmq.unlink();
			posixmq.close();
			node.status({fill: "red", shape: "dot", text: 'link'});
		});
	}

	RED.nodes.registerType("set-button", GuiSetButton);
}
