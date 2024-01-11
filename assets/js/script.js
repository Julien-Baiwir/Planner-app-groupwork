import { format , formatDistanceToNow } from 'https://cdn.jsdelivr.net/npm/date-fns@2.24.0/esm/index.js';
import { fr } from 'https://cdn.jsdelivr.net/npm/date-fns@2.24.0/esm/locale/index.js';

// CREATE CURRENT TIME FOR USER
const updateTime = () => {
  const timerDiv = document.getElementById('Timer');
  const now = new Date();
  const formattedTime = format(now, "EEEE d MMMM yyyy HH'h'mm", { locale: fr });
  timerDiv.textContent = `${formattedTime}`;
};
updateTime();
setInterval(updateTime, 1000);

// CREATE INPUT USER
let input_date = document.getElementById("dueDateInput");
input_date.type = "date";

// FUNCTION UNIQUE ID 
const generateUniqueID = () => {
  const timestamp = new Date().getTime(); // timestamp
  const randomNum = Math.floor(Math.random() * 1000);
  return `${timestamp}-${randomNum}`;
};
// CREATE TASK CONTAINER
const taskContainer = document.createElement("div");
taskContainer.classList.add("task-container");

// CREATE COLUMS
const newTasksColumn = document.createElement("div");
newTasksColumn.classList.add("column");
newTasksColumn.setAttribute("id", "new-tasks");
newTasksColumn.innerHTML = "<h2>Nouvelles tâches</h2>";
const tasksInProgressColumn = document.createElement("div");
tasksInProgressColumn.classList.add("column");
tasksInProgressColumn.setAttribute("id", "tasks-in-progress");
tasksInProgressColumn.innerHTML = "<h2>Tâches en cours</h2>";
const completedTasksColumn = document.createElement("div");
completedTasksColumn.classList.add("column");
completedTasksColumn.setAttribute("id", "completed-tasks");
completedTasksColumn.innerHTML = "<h2>Tâches terminées</h2>";
taskContainer.appendChild(newTasksColumn);
taskContainer.appendChild(tasksInProgressColumn);
taskContainer.appendChild(completedTasksColumn);
const appContainer = document.querySelector(".app");
appContainer.appendChild(taskContainer);

// NEW TASK
let newTask = {
  title: "",
  description: "",
  DueDate: new Date(),
  // ------HIDDEN------
  CreationDate: "",
  id: generateUniqueID(),
  status: "", //("To Do", "In Progress", "Completed")
};

// ADD TASK
const newtasks = document.querySelector("#new-tasks");
const newTaskInput = document.getElementById("input__newtask").querySelector("input");
const descriptionInput = document.getElementById("input__descripttask").querySelector("input");
const dueDateInput = document.getElementById("input__datetask").querySelector("input");

const addTask = () => {
  const title = newTaskInput.value.trim();
  const description = descriptionInput.value.trim();
  const inputDate = dueDateInput.value.trim(); 
  const isTitleValid = title.length >= 3 && title.length <= 256 && typeof title === 'string';
  const isDescriptionValid = description.length === 0 || (description.length >= 5 && description.length <= 1024 && typeof description === 'string');
  const [day, month, year] = inputDate.split('/');
  const dueDate = new Date(`${year}-${month}-${day}`);
  if (
    isTitleValid &&
    isDescriptionValid &&
    !isNaN(dueDate.getTime()) && 
    dueDate.getTime() > Date.now() 
  ) {
    const now = new Date();  
    const formattedCreationDate = format(now, "EEEE d MMMM yyyy HH'h'mm", { locale: fr });

    const newTask = {
      title,
      description,
      DueDate: dueDate.toLocaleDateString(),
      CreationDate: formattedCreationDate,
      id: generateUniqueID(),
      status: "To Do"
    };
    const daysLeft = formatDistanceToNow(dueDate, { locale: fr });
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("card");
    taskDiv.setAttribute("data-task-id", newTask.id); 

    taskDiv.innerHTML = 
    `
       <h3 id="card__title">${newTask.title}</h3>
        <p id="card__description">${newTask.description}</p>
        <p id="card__duedate">A finir avant le: ${newTask.DueDate}</p>
        <p id="card__daysleft">(il reste ${daysLeft} !)</p>
        <p id="card__creationdate>${formattedCreationDate}</p>
        <div id="card__button">
        <img src="assets/img/trash-2.svg" alt="trash" id="card__button__Erase" class="trash-icon">
        <img src="assets/img/edit.svg" alt="edit" id="card__button__Change" class="edit-icon">
        <img src="assets/img/check.svg" alt="check" id="card__button__Submit" class="check-icon">
      </div>
    `; 
    newTasksColumn.appendChild(taskDiv);
    newTaskInput.value = "";
    descriptionInput.value = "";
    dueDateInput.value = "";
    // STORAGE
    let tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
    tasksFromStorage.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasksFromStorage));
  } else {
    alert("Veuillez ajouter :\n- un titre (minimum 3 caractères)\n- une description (minimum 5 caractères)\n- et une date valide");
  }
};

const addBtn = document.getElementById("add-btn");
addBtn.addEventListener("click", addTask);


// "Tasks in Progress" 
const moveTaskInProgressById = (taskId) => {
  const taskCard = document.querySelector(`.card[data-task-id="${taskId}"]`);
  if (taskCard) {
    tasksInProgressColumn.appendChild(taskCard);
    updateTaskStatus(taskId, "In Progress");
    const button = taskCard.querySelector("#card__button__Submit");
    if (button) {
      button.src = "/assets/img/check.svg";
    }
  }
};

// "Completed" 
const moveTaskToCompleted = (taskId) => {
  const taskCard = document.querySelector(`.card[data-task-id="${taskId}"]`);
  if (taskCard) {
    completedTasksColumn.appendChild(taskCard);
    
    const dueDateElement = taskCard.querySelector("#card__duedate");
    if (dueDateElement) {
      const dueDateText = dueDateElement.textContent;
      const dateValue = dueDateText.split(': ')[1]; 
      dueDateElement.textContent = `Terminée le ${dateValue}`; 
    }

const daysLeftElement = taskCard.querySelector("#card__daysleft");
if (daysLeftElement) {
  daysLeftElement.remove();
}
    const buttonsDiv = taskCard.querySelector("#card__button");
    if (buttonsDiv) {
      const eraseButton = buttonsDiv.querySelector("#card__button__Erase");
      buttonsDiv.innerHTML = ''; 
      if (eraseButton) {
        buttonsDiv.appendChild(eraseButton); 
      }
    }
    updateTaskStatus(taskId, "Completed");
  }
};
const updateTaskStatus = (taskId, status) => {
  let tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskToUpdate = tasksFromStorage.find(task => task.id === taskId);
  if (taskToUpdate) {
    taskToUpdate.status = status;
    localStorage.setItem('tasks', JSON.stringify(tasksFromStorage));
  }
};
const handleInProgressButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    moveTaskInProgressById(taskId);
  }
};
const handleCompleteButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    moveTaskToCompleted(taskId);
  }
};
taskContainer.addEventListener("click", (event) => {
  if (event.target && event.target.matches("#card__button__Submit")) {
    const isInProgress = event.target.closest("#tasks-in-progress");
    if (isInProgress) {
      handleCompleteButtonClick(event); 
    } else {
      handleInProgressButtonClick(event); 
    }
  }
});


// SUPRESS FUNCTION--------
const handleEraseButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    card.remove(); 
  }
};
taskContainer.addEventListener("click", (event) => {
  if (event.target && event.target.matches("#card__button__Erase")) {
    handleEraseButtonClick(event);
  }
});

const handleModifyButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    const titleElement = card.querySelector("#card__title");
    const descriptionElement = card.querySelector("#card__description");
    const title = titleElement.textContent;
    const description = descriptionElement.textContent;
    newTaskInput.value = title;
    descriptionInput.value = description;
    card.remove();
  }
};
taskContainer.addEventListener("click", (event) => {
  if (event.target && event.target.matches("#card__button__Change")) {
    handleModifyButtonClick(event);
  }
});

// ------- TRI FUNCTION -----------
const sortTasksByTitle = () => {
  const allColumns = document.querySelectorAll('.column');

  allColumns.forEach((column) => {
    const tasksInColumn = Array.from(column.querySelectorAll('.card'));

    tasksInColumn.sort((taskA, taskB) => {
      const titleA = taskA.querySelector('#card__title').textContent.toLowerCase();
      const titleB = taskB.querySelector('#card__title').textContent.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });

    column.innerHTML = `<h2>${column.querySelector('h2').textContent}</h2>`;
    
    tasksInColumn.forEach((task) => {
      column.appendChild(task);
    });
  });
};

// ------SORTFUNCTION--
const sortTasksByDueDate = () => {
  const allColumns = document.querySelectorAll('.column');

  allColumns.forEach((column) => {
    const tasksInColumn = Array.from(column.querySelectorAll('.card'));

    tasksInColumn.sort((taskA, taskB) => {
      const daysLeftAElement = taskA.querySelector('#card__daysleft');
      const daysLeftBElement = taskB.querySelector('#card__daysleft');

      if (daysLeftAElement && daysLeftBElement) {
        const daysLeftA = parseInt(daysLeftAElement.textContent.split(' ')[2]); 
        const daysLeftB = parseInt(daysLeftBElement.textContent.split(' ')[2]); 

        return daysLeftA - daysLeftB;
      }
      
      return 0;
    });

    column.innerHTML = `<h2>${column.querySelector('h2').textContent}</h2>`;
    
    tasksInColumn.forEach((task) => {
      column.appendChild(task);
    });
  });
};

// --------

// --------
const selectSort = document.getElementById('tri-par');

const handleSortSelection = () => {
  const selectedValue = selectSort.value;
  if (selectedValue === 'titretache') {
    sortTasksByTitle();
  } else if (selectedValue === 'urgence') {
    sortTasksByDueDate();
  }
};

selectSort.addEventListener('change', handleSortSelection);