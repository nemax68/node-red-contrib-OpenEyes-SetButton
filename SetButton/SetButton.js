/**
 * Copyright 2018 OPEN-EYES S.r.l.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

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
        this.name = config.name;
		this.cmd = config.cmd;
        this.queue = '/gui_cmd';

		var node = this;
		var msg;
		var n;
		var send = false;

        node.on('input', function(msg) {
            var posixmq = new PosixMQ();
            var str;
            var payload=msg.payload;
            var n;

            try{
                switch (node.cmd) {
                case "1":
                    var type = "addbutton";
                    var color = {"main":node.maincol,"gradient":node.gradcol}
                    var position = { "x" : node.xpos, "y" : node.ypos };
					var font = { "color" : node.fontcol, "size" : node.fontsize };
					var size = { "x" : node.wsize, "y" : node.hsize };
					var border = { "color" : node.bordercol, "size" : node.bordersize, "round" : node.borderround };
                    break;
                case "2":
                    var type = "addkeypad";
					var color = {"main":node.maincol,"gradient":node.gradcol}
                    var position = { "x" : node.xpos, "y" : node.ypos };
					var font = { "color" : node.fontcol, "size" : node.fontsize };
					var size = { "x" : node.wsize, "y" : node.hsize };
					var border = { "color" : node.bordercol, "size" : node.bordersize, "round" : node.borderround };
                    break;
                default:
                    var type = "none";
                }

                var obj = {
                    type: type,
                    name: node.name,
                    position: position,
                    color: color,
					font: font,
					size: size,
					border: border,
					text: payload
                };

                var strJSON = JSON.stringify(obj);

                posixmq.open({ name: node.queue, create: false });
                n = posixmq.push(strJSON);
                posixmq.close();
                node.status({fill: "green", shape: "dot", text: node.queue.toString()});
            }
            catch(err){
                console.error(err);
                node.status({fill: "red", shape: "dot", text: node.queue.toString()});
            }


        });

	}

	RED.nodes.registerType("set-button", GuiSetButton);
}
