var API_URL_ROOT = "http://localhost:3000",
	model = { taskList: {} };

// MODEL

Object.observe(model, function(changes){
    changes.forEach(function(change) {
        console.log(change.type, change.name, change.oldValue);
        renderTasks();
    });

});

Object.observe(model.taskList, function(changes){
    changes.forEach(function(change) {
        console.log(change.type, change.name, change.oldValue);
        renderTasks();
    });

});

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
		that = this;
		request = new XMLHttpRequest();

	request.open('GET', url, true);
	request.send();
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			model.taskList = new TaskList(JSON.parse(request.responseText));
		} else {
			console.log('GET TASKS: we got a server error');
		}
	}

	request.onerror = function() {
		console.log('GET TASKS: an error of some kind');
	}
}	  

// INTERACTIONS

var submitTaskForm = document.getElementById('submitTask');

submitTaskForm.addEventListener('submit', function(event) {
	event.preventDefault();
	var task = {
			task : {
				description: document.getElementsByClassName('taskInput')[0].value,
				completed : '0'
			}
		},
		url = "http://localhost:3000/" + 'tasks.json',
		request = new XMLHttpRequest();
		request.open('POST', url);
		request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		request.send(JSON.stringify(task));
		console.log(JSON.stringify(task));
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				fetchTasks();
				var inputForm = document.getElementById('submitTask');
				inputForm.reset();
			} else {
				console.log('we got a server error');
				fetchTasks();
			}
		}

		request.onerror = function() {
			console.log('an error of some kind');
			fetchTasks();
		}

})

// Can this be removed from jQuery? It utilizes event delegation, which
// native JS doesn't have
$('#taskList, #completedTasks').on('click', ".deletetask", function(e) {
	e.preventDefault();
	var task = {
			task : {
				id: this.getAttribute('data-id')
			}
		},
		url = "http://localhost:3000/tasks/" + task.task.id + '.json',
		request = new XMLHttpRequest();

	request.open('DELETE', url);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(task));
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			fetchTasks();
		} else {
			console.log('DELETE TASK: we got a server error');
			fetchTasks();
		}
	}

	request.onerror = function() {
		console.log('DELETE TASK: an error of some kind');
		fetchTasks();
	}
});

$('#taskList').on('click', ".completeTask", function(e) {
	e.preventDefault();
	var task = {
			task : {
				id: this.getAttribute('data-id'),
				completed: '1'
			}
		},
		url = "http://localhost:3000/tasks/" + task.task.id + '.json',
		request = new XMLHttpRequest();

	request.open('PUT', url);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(task));
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			fetchTasks();
		} else {
			console.log('EDIT TASK: we got a server error');
			fetchTasks();
		}
	}

	request.onerror = function() {
		console.log('EDIT TASK: an error of some kind');
		fetchTasks();
	}
});

$('#completedTasks').on('click', ".redoTask", function(e) {
	e.preventDefault();
	var task = {
			task : {
				id: this.getAttribute('data-id'),
				completed: '0'
			}
		},
		url = "http://localhost:3000/tasks/" + task.task.id + '.json';
		request = new XMLHttpRequest();

	request.open('PUT', url);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(task));
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			fetchTasks();
		} else {
			console.log('EDIT TASK: we got a server error');
			fetchTasks();
		}
	}

	request.onerror = function() {
		console.log('EDIT TASK: an error of some kind');
		fetchTasks();
	}

});

// allow inline task editing, only for uncompleted tasks!
$('#taskList').on('click', ".taskDescription", function(e) {
	var oldDescription = this.innerHTML,
		parent = this.parentNode,
		inlineForm = document.createElement('form')
		inlineFormField = document.createElement('input');

	this.parentNode.removeChild(this);
	inlineForm.appendChild(inlineFormField);
	inlineForm.classList.add('taskEditForm')
	inlineFormField.classList.add('taskEditField');
	inlineFormField.setAttribute('placeholder',oldDescription);
	parent.insertBefore(inlineForm, parent.firstChild);

});

$('#taskList').on('submit', '.taskEditForm', function(e) {
	e.preventDefault();
	var newDescription = this.children[0].value,
		task = {
			task : {
				id: this.parentNode.getAttribute('data-id'),
				description: newDescription
			}
	};
	url = "http://localhost:3000/tasks/" + task.task.id + '.json';
		request = new XMLHttpRequest();

	request.open('PUT', url);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(task));
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			fetchTasks();
		} else {
			console.log('EDIT TASK: we got a server error');
			fetchTasks();
		}
	}

	request.onerror = function() {
		console.log('EDIT TASK: an error of some kind');
		fetchTasks();
	}
});


// VIEW

function renderTasks() {

	var i,
		tasks = document.querySelectorAll('li'),
		listNode = document.getElementById('taskList'),
		completedList = document.getElementById('completedTasks'),
		
		task;
	
	// remove all existing tasks
	for (i = 0; i < tasks.length; i++) {
		tasks[i].parentNode.removeChild(tasks[i]);
	}
	
	// generate the task list in the DOM
	for(task in model.taskList) {
		var listItemNode = document.createElement('li'),
			listItemDeleteButton = document.createElement('button');
			listItemText = document.createElement('span');
			listItemCompleted = document.createElement('span');

		// First, create the task in the DOM
		listItemNode.classList.add('task');
		listItemNode.setAttribute('data-id',model.taskList[task].id);
		
		// Append the text span to the list item 
		listItemText.innerHTML = model.taskList[task].description;
		listItemText.classList.add('taskDescription');
		listItemCompleted.innerHTML = ' - completed: ' + model.taskList[task].completed;
		listItemNode.appendChild(listItemText);
		listItemNode.appendChild(listItemCompleted);

		// Now, add a delete button to the task (all tasks can be deleted)
		listItemDeleteButton.innerHTML = 'Delete';
		listItemDeleteButton.classList.add('deletetask');
		listItemDeleteButton.setAttribute('data-id',model.taskList[task].id);
		listItemNode.appendChild(listItemDeleteButton);


		// if the task is completed, add a redo button, else add a complete button, 
		// and then append to the proper list
		if (model.taskList[task].completed === false) {
			var listItemCompleteButton = document.createElement('button');

			listItemCompleteButton.innerHTML = 'Completed';
			listItemCompleteButton.classList.add('completeTask');
			listItemCompleteButton.setAttribute('data-id',model.taskList[task].id);
			listItemNode.appendChild(listItemCompleteButton);

			listNode.appendChild(listItemNode);
		}

		if (model.taskList[task].completed === true) {
			var listItemRedoButton = document.createElement('button');

			listItemRedoButton.innerHTML = 'Redo';
			listItemRedoButton.classList.add('redoTask');
			listItemRedoButton.setAttribute('data-id',model.taskList[task].id);
			listItemNode.appendChild(listItemRedoButton);

			completedList.appendChild(listItemNode);
		}
		
 	}
}

// INIT
fetchTasks();