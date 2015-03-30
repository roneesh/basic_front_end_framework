## Front-end framework

This is a front-end framework example using only the DOM API, jQuery is not a dependancy!

It intends to use Object.observe to handle changes to the underlying model and then re-render the page. Since Object.observe is Harmony (ECMAS 7) it can only be used in Chrome right now (thanks for supporting the future Google!)

This task list allows the following:
* create/update/destroy/complete/redo of all tasks
* inline editing of tasks
* escaping out of inline editing

### Architecture

This is a page+script that's served via node on localhost:3001, it communicates with a Rails app serving on localhost:3000. You'll get CORS issues unless you install the Rack::Cors gem and insert new middleware into the Rails app allowing all incoming conections. Obviously this means the app is open to all, so no sensitive information in your tasks ;-)

### Thanks

Thanks to the site: http://youmightnotneedjquery.com/

It has made this project do-able