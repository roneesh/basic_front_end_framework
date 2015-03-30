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

var postPutorDeleteAjaxRequest = function(type, url, data, successCallback, errorCallback) {
	var request = new XMLHttpRequest();
	
	request.open(type, url);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(data));
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			successCallback();
		} else {
			errorCallback();
		}
	}

	request.onerror = function() {
		errorCallback();
	}
}

var submitTaskForm = document.getElementById('submitTask');

submitTaskForm.addEventListener('submit', function(event) {
	event.preventDefault();
	var task = {
			task : {
				description: document.getElementsByClassName('taskInput')[0].value,
				completed : '0'
			}
		},
		url = "http://localhost:3000/" + 'tasks.json';

		postPutorDeleteAjaxRequest('POST',url,task,function() {
			var inputForm = document.getElementById('submitTask');
				fetchTasks();
				inputForm.reset();
		}, function() {
			fetchTasks();
		});
})

var taskList = document.getElementById('taskList'),
	completedTasks = document.getElementById('completedTasks');

taskList.addEventListener('click', function(event) {
	event.preventDefault();
	if (event.target.className === 'deleteTask') {
		var task = {
				task : {
					id: event.target.getAttribute('data-id')
				}
			},
			url = "http://localhost:3000/tasks/" + task.task.id + '.json';
		
		postPutorDeleteAjaxRequest('DELETE',url,task,function() {
			fetchTasks();
		}, function() {
			fetchTasks();
		});
	}
});
completedTasks.addEventListener('click', function(event) {
	event.preventDefault();
	if (event.target && event.target.className === 'deleteTask') {
		var task = {
				task : {
					id: event.target.getAttribute('data-id')
				}
			},
			url = "http://localhost:3000/tasks/" + task.task.id + '.json';

		postPutorDeleteAjaxRequest('DELETE',url,task,function() {
			fetchTasks();
		}, function() {
			fetchTasks();
		});
	}
});

taskList.addEventListener('click', function(event) {
	event.preventDefault();
	if (event.target.className === 'completeTask') {
		var task = {
				task : {
					id: event.target.getAttribute('data-id'),
					completed: '1'
				}
			},
			url = "http://localhost:3000/tasks/" + task.task.id + '.json';
		
		postPutorDeleteAjaxRequest('PUT',url,task,function() {
			fetchTasks();
		}, function() {
			fetchTasks();
		});
	}
});

completedTasks.addEventListener('click', function(event) {
	event.preventDefault();
	if (event.target && event.target.className === 'redoTask') {
		var task = {
				task : {
					id: event.target.getAttribute('data-id'),
					completed: '0'
				}
			},
			url = "http://localhost:3000/tasks/" + task.task.id + '.json';

		postPutorDeleteAjaxRequest('PUT',url,task,function() {
			fetchTasks();
		}, function() {
			fetchTasks();
		});
	}
});


// allow inline task editing, only for uncompleted tasks!

taskList.addEventListener('click', function(event) {
	event.preventDefault();
	if (event.target.className === 'taskDescription') {
		var oldDescription = event.target.innerHTML,
			parent = event.target.parentNode,
			inlineForm = document.createElement('form')
			inlineFormField = document.createElement('input');

		event.target.parentNode.removeChild(event.target);
		inlineForm.appendChild(inlineFormField);
		inlineForm.classList.add('taskEditForm')
		inlineFormField.classList.add('taskEditField');
		inlineFormField.setAttribute('placeholder',oldDescription);
		parent.insertBefore(inlineForm, parent.firstChild);	

	}
});

taskList.addEventListener('submit', function(event) {
	event.preventDefault();
	if (event.target.className === 'taskEditForm') {
		var newDescription = event.target.children[0].value,
			task = {
				task : {
					id: event.target.parentNode.getAttribute('data-id'),
					description: newDescription
				}
			};
			url = "http://localhost:3000/tasks/" + task.task.id + '.json';
	
		postPutorDeleteAjaxRequest('PUT',url,task,function() {
			fetchTasks();
		}, function() {
			fetchTasks();
		});
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
		listItemDeleteButton.classList.add('deleteTask');
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