// MODEL - JUST LIKE PLAIN JS

var API_URL_ROOT = "http://localhost:3000",
	model = { taskList: {} };

function TaskList(taskList) {
	this.list = {},
	that = this;
	taskList.forEach(function(task) {
		var t = new Task(task);
		var id = t.id;
		that.list[id] = t;
	});
	return this.list;
}

function Task(taskObject) {
	this.id = taskObject.id;
	this.description = taskObject.description;
	this.completed = taskObject.completed;
}

function fetchTasks() {
	var url = API_URL_ROOT + '/tasks.json',
		request = new XMLHttpRequest();

	request.open('GET', url, true);
	request.send();
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			model.taskList = new TaskList(JSON.parse(request.responseText));
			React.render(<Tasks completed={false}/>, document.getElementById('taskList'));
			React.render(<Tasks completed={true}/>, document.getElementById('completedTasks'));
		} else {
			console.log('GET TASKS: we got a server error');
		}
	}

	request.onerror = function() {
		console.log('GET TASKS: an error of some kind');
	}
}	  


// VIEWS POWERED BY REACT

var TaskItemWrapper = React.createClass({
  	render: function() {
  		var desc = this.props.data.description,
  			comp = this.props.data.completed.toString();
    	return (
    		<li className={"task"}>
    			<span className={"taskDescription"}>
    				{desc} - {comp}
    			</span>
    			<button 
    				className={comp === "false" ? 'completeTask' : 'redoTask'}>
    					{ comp === "false" ? 'Complete' : 'Redo' }
    			</button>
    			<button className={"deleteTask"}>Delete </button>
    		</li>
    	);
 	 }
});

var Tasks = React.createClass({

	propTypes : {
		completed : React.PropTypes.bool
	},

	getInitialState : function() {
		return {
			tasks: model.taskList
		}
	},

	render: function() {
		
		var taskListItems = [];
		for (var task in this.state.tasks) {
			if (this.state.tasks[task].completed === this.props.completed) {
				taskListItems.push(<TaskItemWrapper data={this.state.tasks[task]} />);
			}
		}
		return ( 
			<ul className={"taskList"}> { taskListItems } </ul>
		);
	}
});

fetchTasks();