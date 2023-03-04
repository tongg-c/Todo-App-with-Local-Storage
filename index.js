const { DateTime } = require('luxon');

const projects = [];

function createProject(name) {
  return {
    name,
    todos: [],
  };
}

const inbox = createProject('Inbox');
let currentProject = inbox;
projects.push(inbox);

// Project Elements
const projectAddField = document.getElementById('projectAddField');
const addProjectButton = document.getElementById('addProjectButton');

// Todo elements
const addTodoForm = document.getElementById('addTodoForm');
const todoListItems = document.getElementById('todoListItems');
const addTodoButton = document.getElementById('addTodoButton');
const addTodoButtonContainer = document.getElementById(
  'addTodoButtonContainer',
);
const addTodoFormClose = addTodoForm.querySelector('.close-add-todo');
const titleInput = document.getElementById('titleInput');

function createTodo(title, dueDate, priority) {
  return {
    title,
    dueDate,
    priority,
    complete: false,
  };
}

function setPriority(todoObject, priority, todoDiv) {
  if (priority === '') return;
  if (priority === 'low') todoDiv.classList.add('green');
  else if (priority === 'medium') todoDiv.classList.add('yellow');
  else todoDiv.classList.add('red');
  todoObject.priority = priority;
}

function getCurrentDayCalculations() {
  const now = DateTime.local().startOf('day');
  const endOfDay = now.endOf('day');
  const differenceInMinutes = Math.round(
    endOfDay.diff(now, 'minutes').values.minutes,
  );
  return {
    now,
    endOfDay,
    differenceInMinutes,
  };
}

function dateUpdater({ dueDate }, dueDateElement) {
  const currentDateObject = getCurrentDayCalculations();
  if (currentDateObject.now > dueDate) dueDateElement.textContent = 'Expired';
  else if (currentDateObject.now < dueDate)
    dueDateElement.textContent = `Due on ${dueDate.toLocaleString()}`;
  else dueDateElement.textContent = 'Due Today';
}

function createTodoDiv(todoObject, indexOfTodo) {
  const todoDiv = document.createElement('div');
  todoDiv.classList.add('todo');

  const checkbox = document.createElement('i');
  checkbox.classList.add('fa-regular', 'fa-circle');
  todoDiv.appendChild(checkbox);

  const todoContent = document.createElement('div');
  todoContent.classList.add('todo-content');
  todoDiv.appendChild(todoContent);

  const todoTitle = document.createElement('p');
  todoTitle.classList.add('todo-title');
  todoTitle.textContent = todoObject.title;
  todoContent.appendChild(todoTitle);
  if (todoObject.dueDate !== '') {
    const dueDateElement = document.createElement('p');
    dueDateElement.classList.add('due-date');
    dateUpdater(todoObject, dueDateElement);
    setInterval(() => {
      dateUpdater(todoObject, dueDateElement);
    }, 60000 * getCurrentDayCalculations().differenceInMinutes);

    todoContent.appendChild(dueDateElement);
  }

  setPriority(todoObject, todoObject.priority, todoDiv);

  const todoButtons = document.createElement('div');
  todoButtons.classList.add('todo-buttons');
  todoDiv.appendChild(todoButtons);

  const editButton = document.createElement('i');
  editButton.classList.add('fa-solid', 'fa-pencil', 'edit-button');
  todoButtons.appendChild(editButton);

  const deleteButton = document.createElement('i');
  deleteButton.classList.add('fa-solid', 'fa-xmark', 'delete-button');
  todoButtons.appendChild(deleteButton);

  editButton.addEventListener('click', () => {
    // eslint-disable-next-line no-use-before-define
    editTodo(todoObject, todoDiv);
    titleInput.focus();
  });

  deleteButton.addEventListener('click', () => {
    currentProject.todos.splice(indexOfTodo, 1);
    todoDiv.remove();
  });

  checkbox.addEventListener('click', () => {
    todoObject.complete = !todoObject.complete;
    if (todoObject.complete) {
      checkbox.classList.remove('fa-circle');
      checkbox.classList.add('fa-circle-check');
    }
    if (todoObject.complete === false) {
      checkbox.classList.remove('fa-circle-check');
      checkbox.classList.add('fa-circle');
    }
    todoDiv.classList.toggle('checked');
  });

  return todoDiv;
}

function renderTodos(currentProjectValue) {
  todoListItems.innerHTML = '';
  document.getElementById('currentProjectTitle').textContent =
    currentProjectValue.name;
  currentProjectValue.todos.forEach((todoObject, indexOfTodo) => {
    todoListItems.append(createTodoDiv(todoObject, indexOfTodo));
  });
}

function convertToDateTime(dueDate) {
  const [month, day, year] = dueDate.split('-').map(Number);
  return DateTime.local(month, day, year).startOf('day');
}

const saveToLocalStorage = () => {
  localStorage.setItem('projects', JSON.stringify(projects));
  localStorage.setItem('projects', JSON.stringify(inbox));
};
const retrieveFromLocalStorage = () => ({
  projects: JSON.parse(localStorage.getItem('projects')),
  inbox: JSON.parse(localStorage.getItem('inbox')),
});

function formSubmit(e) {
  e.preventDefault();

  addTodoButtonContainer.classList.toggle('hidden');
  addTodoForm.classList.toggle('hidden');

  const title = addTodoForm.elements.title.value.trim();
  const dueDate =
    addTodoForm.elements.dueDate.value === ''
      ? ''
      : convertToDateTime(addTodoForm.elements.dueDate.value);

  const priority = addTodoForm.elements.priority.value;

  const todo = createTodo(title, dueDate, priority);
  currentProject.todos.push(todo);

  const indexOfTodo = currentProject.todos.length - 1;
  todoListItems.append(createTodoDiv(todo, indexOfTodo));

  addTodoForm.reset();
}
addTodoForm.addEventListener('submit', formSubmit);

function editTodo(todoObject, todoDiv) {
  addTodoButtonContainer.classList.add('hidden');
  addTodoForm.classList.remove('hidden');

  // pre-fill form fields with existing todo values
  addTodoForm.elements.title.value = todoObject.title;
  if (todoObject.dueDate !== '')
    addTodoForm.elements.dueDate.value = todoObject.dueDate
      .toISO()
      .substr(0, 10);
  addTodoForm.elements.priority.value = todoObject.priority;

  // change form submission event listener to handle updating todos
  addTodoForm.removeEventListener('submit', formSubmit);
  addTodoForm.addEventListener(
    'submit',
    e => {
      e.preventDefault();

      const newTitle = addTodoForm.elements.title.value.trim();
      const newDueDate = convertToDateTime(addTodoForm.elements.dueDate.value);
      const newPriority = addTodoForm.elements.priority.value;

      // update todo values
      todoObject.title = newTitle;
      todoObject.dueDate = newDueDate;
      setPriority(todoObject, newPriority, todoDiv);

      // reset form and hide it
      addTodoForm.reset();
      addTodoButtonContainer.classList.remove('hidden');
      addTodoForm.classList.add('hidden');

      // re-render todo list
      renderTodos(currentProject);

      // add form submission event listener back to handle adding todos
      addTodoForm.addEventListener('submit', formSubmit);
    },
    { once: true },
  );
}

function createProjectElements(projectObject, i) {
  const projectLi = document.createElement('li');
  const p = document.createElement('p');
  p.textContent = projectObject.name;

  if (projectObject !== inbox) {
    const deleteButton = document.createElement('i');
    deleteButton.classList.add('fa-solid', 'fa-xmark', 'delete-button');
    const editButton = document.createElement('i');
    editButton.classList.add('fa-solid', 'fa-pencil', 'edit-button');
    const img = document.createElement('img');
    img.src = 'svgs/project.svg';

    // Append elements to projectLi
    projectLi.append(img, p, editButton, deleteButton);

    // Handle click event for delete button
    deleteButton.addEventListener('click', e => {
      e.stopPropagation();
      if (currentProject === projectObject) renderTodos(inbox);
      projects.splice(i, 1);
      projectLi.remove();
    });

    // Handle click event for edit button
    const editInput = document.createElement('input');
    editInput.spellcheck = false;
    editInput.classList.add('edit-input');
    let editMode = false;
    editButton.addEventListener('click', e => {
      e.stopPropagation();
      editMode = !editMode;
      if (editMode) {
        editButton.className = '';
        editButton.classList.add('fa-solid', 'fa-check', 'confirm-edit');
        editInput.value = projectObject.name;
        p.replaceWith(editInput);
        editInput.focus();
      } else {
        if (editInput.value === '') {
          alert('Please enter a name for your project');
          editInput.focus();
          return;
        }
        editButton.className = '';
        editButton.classList.add('fa-solid', 'fa-pencil', 'edit-button');
        projectObject.name = editInput.value;
        p.textContent = projectObject.name;
        editInput.replaceWith(p);
      }
    });

    document.addEventListener('click', e => {
      if (e.target.closest('.edit-input') || editMode === false) return;
      editButton.click();
      projectLi.click();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && editMode) {
        editButton.click();
        projectLi.click();
      }
    });
  }
  if (projectObject === inbox) {
    const img = document.createElement('img');
    img.src = 'svgs/inbox.svg';
    projectLi.append(img, p);
  }

  // Handle click event for projectLi
  projectLi.addEventListener('click', () => {
    currentProject = projectObject;
    renderTodos(currentProject);
  });

  return projectLi;
}

function renderProjects() {
  const projectList = document.getElementById('projectList');
  projectList.innerHTML = '';

  // Iterate through projects and create elements
  projects.forEach((projectObject, i) => {
    const projectElements = createProjectElements(projectObject, i);
    projectList.append(projectElements);
  });
}

addProjectButton.addEventListener('click', () => {
  const inputValue = projectAddField.value;
  if (inputValue === '') return;
  const newProject = createProject(inputValue);
  projects.push(newProject);
  renderProjects();
  projectAddField.value = '';
});

projectAddField.addEventListener('keyup', e => {
  if (e.key === 'Enter') addProjectButton.click();
});

addTodoButton.addEventListener('click', () => {
  addTodoButtonContainer.classList.toggle('hidden');
  addTodoForm.classList.toggle('hidden');
});

addTodoFormClose.addEventListener('click', () => {
  addTodoButtonContainer.classList.toggle('hidden');
  addTodoForm.classList.toggle('hidden');
  addTodoForm.reset();
});

renderTodos(inbox);
renderProjects();
