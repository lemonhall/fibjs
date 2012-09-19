/**
 * 
 */

console.log('buffered testing....');

var assert = require('assert');
var fs = require('fs');
var io = require('io');
var net = require('net');

var s = '0123456789\r\n';

for ( var i = 0; i < 10; i++)
	s = s + s;

var f = fs.open("test0000", 'w');
f.write(new Buffer(s));
f.close();

function t_read(f, sz) {
	var r = new io.BufferedStream(f);
	var p = 0;
	var d;

	while (p < s.length) {
		d = r.read(sz);
		if (!d)
			break;
		assert.equal(d.toString(), s.substring(p, p + sz));
		p += sz;
	}
	f.close();
}

for ( var i = 3; i < 100000; i *= 3)
	t_read(fs.open("test0000"), i);

function accept1(s) {
	while (true) {
		var c = s.accept();
		var f = fs.open('test0000');
		f.copyTo(c);
		f.close();
		c.close();
	}
}

var s1 = new net.Socket();
s1.bind(8182);
s1.listen();
accept1.start(s1);

for ( var i = 3; i < 100000; i *= 3) {
	var conn = new net.Socket();
	conn.connect('127.0.0.1', 8182);
	t_read(conn, i);
}

f = fs.open("test0000");
var r = new io.BufferedStream(f);
r.EOL = '\r\n';

var n = 0;

while ((s = r.readLine()) !== null) {
	assert.equal('0123456789', s);
	n++;
}
assert.equal(1024, n);
f.close();

f = fs.open("test0000");
var r = new io.BufferedStream(f);
r.EOL = '\r\n';

assert.equal(r.readLine(10), '0123456789');
assert.throws(function() {
	r.readLine(9);
});

f.close();
fs.unlink("test0000");
