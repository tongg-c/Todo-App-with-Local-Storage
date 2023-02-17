const projects = []

const inbox = createProject('Inbox')
let currentProject = inbox
projects.push(inbox)
function createProject(name) {
	return {
		name: name,
		todos: [],
	}
}

function createTodo(title, dueDate, priority) {
	return {
		title: title,
		dueDate: dueDate,
		priority: priority,
		complete: false,
	}
}

function addTodoToProject(newTodo, currentProject) {
	currentProject.todos.push(newTodo)
}

function markTodoComplete(todo) {
	todo.complete = true
}

function deleteTodo(todo, project) {
	let index = project.todos.indexOf(todo)
	project.todos.splice(index, 1)
}

const addProjectButton = document.getElementById('addProjectButton')
addProjectButton.addEventListener('click', function () {
	const projectAddField = document.getElementById('projectAddField')
	const inputValue = projectAddField.value
	if (inputValue === '') return
	const newProject = createProject(inputValue)
	projects.push(newProject)
	renderProjects()
	projectAddField.value = ''
})

function createProjectElements(projectObject, i) {
	const projectLi = document.createElement('li')
	const p = document.createElement('p')
	p.textContent = projectObject.name

	if (projectObject !== inbox) {
		const deleteButton = document.createElement('i')
		deleteButton.classList.add('fa-solid', 'fa-xmark', 'delete-button')
		const editButton = document.createElement('i')
		editButton.classList.add('fa-solid', 'fa-pencil', 'edit-button')
		const img = document.createElement('img')
		img.src = 'svgs/project.svg'

		// Append elements to projectLi
		projectLi.append(img, p, editButton, deleteButton)

		// Handle click event for delete button
		deleteButton.addEventListener('click', e => {
			e.stopPropagation()
			renderTodos(inbox)
			projects.splice(i, 1)
			projectLi.remove()
		})

		// Handle click event for edit button
		const editInput = document.createElement('input')
		editInput.spellcheck = false
		editInput.classList.add('edit-input')
		let editMode = false
		editButton.addEventListener('click', e => {
			e.stopPropagation()
			editMode = !editMode
			console.log(editMode)
			if (editMode) {
				editButton.className = ''
				editButton.classList.add('fa-solid', 'fa-check', 'confirm-edit')
				editInput.value = projectObject.name
				p.replaceWith(editInput)
				editInput.focus()
			} else {
				if (editInput.value === '') {
					alert('Please enter a name for your project')
					editInput.focus()
					return
				}
				editButton.className = ''
				editButton.classList.add('fa-solid', 'fa-pencil', 'edit-button')
				projectObject.name = editInput.value
				p.textContent = projectObject.name
				editInput.replaceWith(p)
			}
		})

		document.addEventListener('click', e => {
			if (e.target.closest('.edit-input') || editMode === false) return
			editButton.click()
			renderCurrentProject(projectObject)
		})
		document.addEventListener('keydown', e => {
			if (e.key === 'Enter' && editMode) {
				editButton.click()
				renderCurrentProject(projectObject)
			}
		})
	}
	if (projectObject === inbox) {
		const img = document.createElement('img')
		img.src = 'svgs/inbox.svg'
		projectLi.append(img, p)
	}

	// Handle click event for projectLi
	projectLi.addEventListener('click', () => {
		currentProject = projectObject
		renderTodos(currentProject)
	})

	return projectLi
}

function renderProjects() {
	const projectList = document.getElementById('projectList')
	projectList.innerHTML = ''

	// Iterate through projects and create elements
	projects.forEach((projectObject, i) => {
		const projectElements = createProjectElements(projectObject, i)
		projectList.append(projectElements)
	})
}

const addTodoButton = document.getElementById('addTodoButton')
const addTodoForm = document.getElementById('addTodoForm')
const addTodoButtonContainer = document.getElementById('addTodoButtonContainer')
const closeAddTodo = document.querySelector('.close-add-todo')

addTodoButton.addEventListener('click', function () {
	addTodoButtonContainer.classList.toggle('hidden')
	addTodoForm.classList.toggle('hidden')
})

closeAddTodo.addEventListener('click', () => {
	addTodoButtonContainer.classList.toggle('hidden')
	addTodoForm.classList.toggle('hidden')
	addTodoForm.reset()
})

const todoListItems = document.getElementById('todoListItems')
addTodoForm.addEventListener('submit', e => {
	e.preventDefault()

	addTodoButtonContainer.classList.toggle('hidden')
	addTodoForm.classList.toggle('hidden')

	const title = addTodoForm.elements.title.value
	const dueDate = addTodoForm.elements.dueDate.value
	const priority = addTodoForm.elements.priority.value
	const todo = createTodo(title, dueDate, priority)
	currentProject.todos.push(todo)
	todoListItems.append(createTodoDiv(todo))
	addTodoForm.reset()
})

function createTodoDiv(todoObject, index) {
	const todoDiv = document.createElement('div')
	todoDiv.classList.add('todo')

	const checkbox = document.createElement('i')
	checkbox.classList.add('fa-regular', 'fa-circle')
	todoDiv.appendChild(checkbox)

	const todoContent = document.createElement('div')
	todoContent.classList.add('todo-content')
	todoDiv.appendChild(todoContent)

	const todoTitle = document.createElement('p')
	todoTitle.classList.add('todo-title')
	todoTitle.textContent = todoObject.title
	todoContent.appendChild(todoTitle)

	const dueDate = document.createElement('p')
	dueDate.classList.add('due-date')
	dueDate.textContent = todoObject.dueDate
	setPriority(todoObject, todoObject.priority, dueDate)

	todoContent.appendChild(dueDate)
	console.log(dueDate)

	const todoButtons = document.createElement('div')
	todoButtons.classList.add('todo-buttons')
	todoDiv.appendChild(todoButtons)

	const editButton = document.createElement('i')
	editButton.classList.add('fa-solid', 'fa-pencil', 'edit-button')
	todoButtons.appendChild(editButton)

	const deleteButton = document.createElement('i')
	deleteButton.classList.add('fa-solid', 'fa-xmark', 'delete-button')
	todoButtons.appendChild(deleteButton)

	editButton.addEventListener('click', () => {
		console.log('hi')
	})

	deleteButton.addEventListener('click', () => {
		currentProject.todos.splice(index, 1)
		todoDiv.remove()
	})

	checkbox.addEventListener('click', () => {
		todoObject.complete = !todoObject.complete
		if (todoObject.complete) {
			checkbox.classList.remove('fa-circle')
			checkbox.classList.add('fa-circle-check')
			console.log('The checkbox is checked')
		}
		if (todoObject.complete === false) {
		    checkbox.classList.remove('fa-circle-check')
			checkbox.classList.add('fa-circle')
			console.log('The checkbox is unchecked')
		}
		todoDiv.classList.toggle('checked')
	})

	return todoDiv
}

function setPriority(currentProject, priority, dueDateElement) {
	if (priority === '') return
	if (priority === 'low') dueDateElement.style.color = 'green'
	else if (priority === 'medium') dueDateElement.style.color = 'yellow'
	else dueDateElement.style.color = 'red'
	currentProject.dueDate = priority
}

function renderTodos(currentProject) {
	todoListItems.innerHTML = ''
	document.getElementById('currentProjectTitle').textContent =
		currentProject.name
	currentProject.todos.forEach((todoObject, index) => {
		todoListItems.append(createTodoDiv(todoObject, index))
	})
}

renderTodos(inbox)
renderProjects()
