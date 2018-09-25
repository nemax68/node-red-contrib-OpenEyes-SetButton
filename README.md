Description
===========

![PosixMQ-flow](https://raw.githubusercontent.com/DE7GK35/PosixMQ-read/master/PosixMQ-flow.png)

A [node.js](http://nodejs.org/) library for using POSIX message queues. Originally forked from mscdex/pmq to provide additional customization of flags passed to `mq_open()`. Subsequently re-written to support v4+ using [Native Abstractions for Node.js](https://github.com/nodejs/nan).


Requirements
============

* [node.js](http://nodejs.org/) -- tested against v8+

* [node-red](http://nodered.org/)

* Linux 2.6.6+ or FreeBSD kernel with POSIX message queue support compiled in (`CONFIG_POSIX_MQUEUE`, which is enabled by default)

* See `man mq_overview` for how/where to modify global POSIX message queue resource limits

* Depends on [nan](https://www.npmjs.com/package/nan) & [posix-mq](https://www.npmjs.com/package/posix-mq) which will be automatically installed when running `npm install posixmq-read`.

Install
=======

```shell
$ npm install posixmq-read
```
Values
========

![Values](https://raw.githubusercontent.com/DE7GK35/PosixMQ-read/master/editValues.png)

* **msgname** - _String_ - name of message queue.

* **maxmsgs** - _Number_ - The maximum number of messages in the queue.

* **msgsize** - _Number_ - The maximum size of messages in the queue.

Examples
========


* Open an existing queue, read all of its messages, and then remove and close it:

```javascript
var PosixMQ = require('posix-mq');

module.exports = function (RED) {    
 function PosixMQReadNode(config) {
  RED.nodes.createNode(this,config);
  this.msgname = config.msgname;
  this.msgsize = Number(config.msgsize);
  this.maxmsgs = Number(config.maxmsgs);
  var posixmq = new PosixMQ();
  var node = this;
  var msg;
  var n;
 

  var send = false;
  posixmq.open({ name: node.msgname.toString(),create: true,mode: '0777',maxmsgs: node.maxmsgs, msgsize: node.msgsize });
  node.status({fill: "green", shape: "dot", text: node.msgname.toString()});
  node.warn("the " + node.msgname.toString() + " message queue is open");
  readbuf = new Buffer(posixmq.msgsize);
  node.on('input', function() { 
     var str = "";
     while ((n = posixmq.shift(readbuf)) !== false){
      send = true;
      str = str + readbuf.toString('utf8', 0, n);
      };
      if (send){node.send({payload: str})};
      send = false;
  });
  node.on('close', function() { 
    posixmq.unlink();
    posixmq.close();
    node.status({fill: "red", shape: "dot", text: node.msgname.toString()});});
 }
 RED.nodes.registerType("posixmq-read", PosixMQReadNode);
}
```



API
===

Events
------

* **messages**() - Emitted every time the queue goes from empty to having at least one message.

* **drain**() - Emitted when there is room for at least one message in the queue.

Properties 
----------------------

* **isFull** - _boolean_ - Convenience property that returns true if `curmsgs` === `maxmsgs`.

* **maxmsgs** - _integer_ - The maximum number of messages in the queue.

* **msgsize** - _integer_ - The maximum size of messages in the queue.

* **curmsgs** - _integer_ - The number of messages currently in the queue.

Methods
-------

* **(constructor)**() - Creates and returns a new PosixMQ instance.

* **open**(<_object_>config) - _(void)_ - Connects to a queue. Valid properties in `config` are:

    * name - _string_ - The name of the queue to open, it **MUST** start with a '/'.

    * create - _boolean_ - Set to `true` to create the queue if it doesn't already exist (default is `false`). The queue will be owned by the user and group of the current process.

    * exclusive - _boolean_ - If creating a queue, set to true if you want to ensure a queue with the given name does not already exist.

    * mode - _mixed_ - If creating a queue, this is the permissions to use. This can be an octal string (e.g. '0777') or an integer.

    * maxmsgs - _integer_ - If creating a queue, this is the maximum number of messages the queue can hold. This value is subject to the system limits in place and defaults to 10.

    * msgsize - _integer_ - If creating a queue, this is the maximum size of each message (in bytes) in the queue. This value is subject to the system limits in place and defaults to 8192 bytes.

    * flags - _integer_ - Default is `O_RDWR | O_NONBLOCK` (2050). If a different set of flags is required, its integer value may be provided here. See the man page for `mq_open` for more information.
    
* **close**() - _(void)_ - Disconnects from the queue.

* **unlink**() - _(void)_ - Removes the queue from the system.

* **push**(< _Buffer_ or _string_ >data[, < _integer_ >priority]) - _boolean_ - Pushes a message with the contents of `data` onto the queue with the optional `priority` (defaults to 0). `data` is either a string or Buffer object. `priority` is an integer between 0 and 31 inclusive.

* **shift**(< _Buffer_ >readbuf[, < _boolean_ >returnTuple]) - _mixed_ - Shifts the next message off the queue and stores it in `readbuf`. If `returnTuple` is set to true, an array containing the number of bytes in the shifted message and the message's priority are returned, otherwise just the number of bytes is returned (default). If there was nothing on the queue, false is returned.
