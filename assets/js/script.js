import { format } from 'https://cdn.jsdelivr.net/npm/date-fns@2.24.0/esm/index.js';
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

  // Parse the input date value to create a Date object (assuming it's in the format dd/mm/yyyy)
  const [day, month, year] = inputDate.split('/');
  const dueDate = new Date(`${year}-${month}-${day}`);

  if (
    title !== "" &&
    description !== "" &&
    !isNaN(dueDate.getTime()) && // Check if the parsed date is valid
    dueDate.getTime() > Date.now() // Check if the due date is in the future
  ) {
    const newTask = {
      title,
      description,
      DueDate: dueDate.toLocaleDateString(),
      id: generateUniqueID(),
      status: "To Do"
    };

      const taskDiv = document.createElement("div");
      taskDiv.classList.add("card");
      taskDiv.setAttribute("data-task-id", newTask.id); // Set data-task-id attribute

      taskDiv.innerHTML = 
      `
          <h3 id="card__title">${newTask.title}</h3>
          <p id="card__description">${newTask.description}</p>
          <p id="card__duedate">A finir avant le: ${newTask.DueDate}</p>
          <div id="card__button">
              <button id="card__button__Erase"> effacer</button>
              <button id="card__button__Change">modifier</button>
              <button id="card__button__Submit">commencer</button>
          </div>
      `; 

      newtasks.appendChild(taskDiv);

      newTaskInput.value = "";
      descriptionInput.value = "";
      dueDateInput.value = "";

      // Store the new task in local storage
      let tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
      tasksFromStorage.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasksFromStorage));

  } else {
      alert("Please provide a title, description, and a valid number of days for the task.");
  }
};

const addBtn = document.getElementById("add-btn");
addBtn.addEventListener("click", addTask);

// ----------------
// -----------

// Function to move the card to "Tasks in Progress" using unique ID
const moveTaskInProgressById = (taskId) => {
  const taskCard = document.querySelector(`.card[data-task-id="${taskId}"]`);
  if (taskCard) {
    const tasksInProgressContainer = document.getElementById("tasks-in-progress");
    tasksInProgressContainer.appendChild(taskCard);
    // Change the text of the button to "terminer"
    const button = taskCard.querySelector("#card__button__Submit");
    if (button) {
      button.textContent = "terminer";
    }
  }
};

// Function to move the card to "Completed Tasks" and retain the "effacer" button
const moveTaskToCompleted = (taskId) => {
  const taskCard = document.querySelector(`.card[data-task-id="${taskId}"]`);
  if (taskCard) {
    const completedTasksContainer = document.getElementById("completed-tasks");
    completedTasksContainer.appendChild(taskCard);

    // Update the due date display for completed tasks
    const dueDateElement = taskCard.querySelector("#card__duedate");
    if (dueDateElement) {
      const dueDateText = dueDateElement.textContent;
      const dateValue = dueDateText.split(': ')[1]; // Extract the date part
      dueDateElement.textContent = `Terminée le ${dateValue}`; // Modify the text
    }

    // Remove buttons except the "effacer" button from the card
    const buttonsDiv = taskCard.querySelector("#card__button");
    if (buttonsDiv) {
      const eraseButton = buttonsDiv.querySelector("#card__button__Erase");
      buttonsDiv.innerHTML = ''; // Remove all content within the buttons div
      if (eraseButton) {
        buttonsDiv.appendChild(eraseButton); // Append the "effacer" button back
      }
    }
  }
};

// Function to handle "Submit" button click event for moving task to "Tasks in Progress"
const handleInProgressButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    moveTaskInProgressById(taskId);
  }
};

// Function to handle "Submit" button click event for moving task to "Completed Tasks"
const handleCompleteButtonClick = (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const taskId = card.getAttribute("data-task-id");
    moveTaskToCompleted(taskId);
  }
};

// Event delegation for "Submit" button clicks within the task-container
const taskContainer = document.querySelector(".task-container");
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
    card.remove(); // Remove the entire card element
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