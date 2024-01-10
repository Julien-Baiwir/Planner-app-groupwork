import { format , formatDistanceToNow } from 'https://cdn.jsdelivr.net/npm/date-fns@2.24.0/esm/index.js';
import { fr } from 'https://cdn.jsdelivr.net/npm/date-fns@2.24.0/esm/locale/index.js';

const updateTime = () => {
  const timerDiv = document.getElementById('Timer');
  const now = new Date();

  // Use French locale
  const formattedTime = format(now, "EEEE d MMMM yyyy HH'h'mm", { locale: fr });

  timerDiv.textContent = `${formattedTime}`;
};

updateTime();
setInterval(updateTime, 1000);

// ---------
let input_date = document.getElementById("dueDateInput");
input_date.type = "date";

// -------2 unique ID------
const generateUniqueID = () => {
  const timestamp = new Date().getTime(); // timestamp
  const randomNum = Math.floor(Math.random() * 1000);
  return `${timestamp}-${randomNum}`;
};
// -------CREATE TASK CONTAINER------
// Create task container
const taskContainer = document.createElement("div");
taskContainer.classList.add("task-container");

// Create columns
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

// Append columns to task container
taskContainer.appendChild(newTasksColumn);
taskContainer.appendChild(tasksInProgressColumn);
taskContainer.appendChild(completedTasksColumn);

// Append task container to the main app container
const appContainer = document.querySelector(".app");
appContainer.appendChild(taskContainer);

// -------3 New task------
let newTask = {
  title: "",
  description: "",
  DueDate: new Date(),
  // ------non visible------
  CreationDate: "",
  id: generateUniqueID(),
  status: "", //("To Do", "In Progress", "Completed")
};

// -------4 Add task------

const newtasks = document.querySelector("#new-tasks");
const newTaskInput = document.getElementById("input__newtask").querySelector("input");
const descriptionInput = document.getElementById("input__descripttask").querySelector("input");
const dueDateInput = document.getElementById("input__datetask").querySelector("input");

const addTask = () => {
  const title = newTaskInput.value.trim();
  const description = descriptionInput.value.trim();
  const inputDate = dueDateInput.value.trim(); // Get the input date value
 
  // Validate title length and format
 const isTitleValid = title.length >= 3 && title.length <= 256 && typeof title === 'string';

 // Validate description length and format
 const isDescriptionValid = description.length === 0 || (description.length >= 5 && description.length <= 1024 && typeof description === 'string');
  
 // Parse the input date value to create a Date object (assuming it's in the format dd/mm/yyyy)
  const [day, month, year] = inputDate.split('/');
  const dueDate = new Date(`${year}-${month}-${day}`);

  if (
    isTitleValid &&
    isDescriptionValid &&
    !isNaN(dueDate.getTime()) && // Check if the parsed date is valid
    dueDate.getTime() > Date.now() // Check if the due date is in the future
  ) {
    const now = new Date();
    // Format the current date as CreationDate using French locale
    
    const formattedCreationDate = format(now, "EEEE d MMMM yyyy HH'h'mm", { locale: fr });

    const newTask = {
      title,
      description,
      DueDate: dueDate.toLocaleDateString(),
      CreationDate: formattedCreationDate, // Add formatted CreationDate here
      id: generateUniqueID(),
      status: "To Do"
    };
    const daysLeft = formatDistanceToNow(dueDate, { locale: fr });

    const taskDiv = document.createElement("div");
    taskDiv.classList.add("card");
    taskDiv.setAttribute("data-task-id", newTask.id); // Set data-task-id attribute

    taskDiv.innerHTML = 
    `
       <h3 id="card__title">${newTask.title}</h3>
        <p id="card__description">${newTask.description}</p>
        <p id="card__duedate">A finir avant le: ${newTask.DueDate}</p>
        <p id="card__daysleft">(il reste ${daysLeft} !)</p>
        
        <div id="card__button">
        <img src="/assets/img/trash-2.svg" alt="trash" id="card__button__Erase" class="trash-icon">
        <img src="/assets/img/edit.svg" alt="edit" id="card__button__Change" class="edit-icon">
        <img src="/assets/img/check.svg" alt="check" id="card__button__Submit" class="check-icon">
      </div>
    `; 

    // newtasks.appendChild(taskDiv);
    newTasksColumn.appendChild(taskDiv);
    newTaskInput.value = "";
    descriptionInput.value = "";
    dueDateInput.value = "";

    // Store the new task in local storage
    let tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
    tasksFromStorage.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasksFromStorage));

  } else {
    alert("Veuillez ajouter :\n- un titre (minimum 3 caractères)\n- une description (minimum 5 caractères)\n- et une date valide");
  }
};

const addBtn = document.getElementById("add-btn");
addBtn.addEventListener("click", addTask);


// Function to move the card to "Tasks in Progress" using unique ID
const moveTaskInProgressById = (taskId) => {
  const taskCard = document.querySelector(`.card[data-task-id="${taskId}"]`);
  if (taskCard) {
    tasksInProgressColumn.appendChild(taskCard);
    // Change the image source of the submit button to the 'check' icon
    const button = taskCard.querySelector("#card__button__Submit");
    if (button) {
      button.src = "/assets/img/check.svg";
    }
  }
};

// move the card to "Completed Tasks" and retain the "erase" image button
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

   
    const buttonsDiv = taskCard.querySelector("#card__button");
    if (buttonsDiv) {
      const eraseButton = buttonsDiv.querySelector("#card__button__Erase");
      buttonsDiv.innerHTML = ''; 
      if (eraseButton) {
        buttonsDiv.appendChild(eraseButton); 
      }
    }
  }
};

// "Submit" "Tasks in Progress"
const handleInProgressButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    moveTaskInProgressById(taskId);
  }
};

// "Submit" moving task to "Completed Tasks"
const handleCompleteButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    moveTaskToCompleted(taskId);
  }
};

// Event delegation  "Submit" the task-container
// taskContainer = document.querySelector(".task-container");
taskContainer.addEventListener("click", (event) => {
  if (event.target && event.target.matches("#card__button__Submit")) {
    const isInProgress = event.target.closest("#tasks-in-progress");
    if (isInProgress) {
      handleCompleteButtonClick(event); // Task in Progress
    } else {
      handleInProgressButtonClick(event); // Completed Task
    }
  }
});



// SUPRESS FUNCTION--------
// Function to handle "Erase" button click event for removing the card
const handleEraseButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    card.remove(); 
  }
};

// Event delegation for "Erase" button clicks within the task-container
taskContainer.addEventListener("click", (event) => {
  if (event.target && event.target.matches("#card__button__Erase")) {
    handleEraseButtonClick(event);
  }
});

// Function to handle "Modifier" button click event
const handleModifyButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    const titleElement = card.querySelector("#card__title");
    const descriptionElement = card.querySelector("#card__description");
    
    // Get the title and description from the card
    const title = titleElement.textContent;
    const description = descriptionElement.textContent;
    
    // Set the values back to the input fields
    newTaskInput.value = title;
    descriptionInput.value = description;
    
    // Remove the card from the list
    card.remove();
  }
};

// Event delegation for "Modifier" button clicks within the task-container
taskContainer.addEventListener("click", (event) => {
  if (event.target && event.target.matches("#card__button__Change")) {
    handleModifyButtonClick(event);
  }
});