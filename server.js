var connect = require('connect'),
	serveStatic = require('serve-static');

connect().use(serveStatic('./')).listen(3001);