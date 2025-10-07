class Task {

    constructor(name, nameNormalized, isConcluded = false) {
        this.name = name;
        this.nameNormalized = nameNormalized
        this.isConcluded = isConcluded
    }

}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function normalizeText(text) {
    return text
        .normalize("NFD")                   
        .replace(/[\u0300-\u036f]/g, "")    
        .trim()                             
        .toUpperCase();                     
}

function createItem(taskName) {

    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    const taskEditInput = document.createElement("input");
    taskEditInput.classList.add("task-edit-input");
    taskEditInput.setAttribute("value", `${taskName}`);
    taskEditInput.setAttribute("disabled", "true");
    
    taskItem.appendChild(taskEditInput);

    const taskButtonsContainer = document.createElement("div");
    taskButtonsContainer.classList.add("task-buttons-container");

    const taskEditButton = document.createElement("button");
    taskEditButton.classList.add("task-edit-button");
    taskEditButton.classList.add("task-button");

    const editIcon = document.createElement("img");
    editIcon.setAttribute("src", "images/edit-icon.png");
    editIcon.classList.add("task-button-icon");
    taskEditButton.appendChild(editIcon);

    const taskRemoveButton = document.createElement("button");
    taskRemoveButton.classList.add("task-remove-button");
    taskRemoveButton.classList.add("task-button");

    const removeIcon = document.createElement("img");
    removeIcon.setAttribute("src", "images/remove-icon.png");
    removeIcon.classList.add("task-button-icon");
    taskRemoveButton.appendChild(removeIcon);

    const taskConcludeButton = document.createElement("button");
    taskConcludeButton.classList.add("task-conclude-button");
    taskConcludeButton.classList.add("task-button");

    const concludeIcon = document.createElement("img");
    concludeIcon.setAttribute("src", "images/conclude-icon.png");
    concludeIcon.classList.add("task-button-icon");
    taskConcludeButton.appendChild(concludeIcon);

    taskEditButton.addEventListener("click", (e) => { editTask(e.target); });
    taskRemoveButton.addEventListener("click", (e) => { removeTask(e.target) });
    taskConcludeButton.addEventListener("click", (e) => { concludeTask(e.target) });

    taskButtonsContainer.appendChild(taskEditButton);
    taskButtonsContainer.appendChild(taskRemoveButton);
    taskButtonsContainer.appendChild(taskConcludeButton);

    taskItem.appendChild(taskButtonsContainer);
    
    return taskItem;
}

function loadTasks() {

    let tasksSaved = JSON.parse(localStorage.getItem("tasks"));

    for(let t of tasksSaved) {

        const taskItem = createItem(t.name);

        if(t.isConcluded === false) {
            const activeTaskList = document.getElementById("active-task-list");
            activeTaskList.appendChild(taskItem);
        }
        else {
            const concludedTaskList = document.getElementById("concluded-task-list");
            concludedTaskList.appendChild(taskItem);   
        }
    }
}

function showTasksContainer() {

    const activeTaskContainer = document.getElementById("active-task-container");
    const concludedTaskContainer = document.getElementById("concluded-task-container");

    const activeTaskList = document.getElementById("active-task-list");
    const concludedTaskList = document.getElementById("concluded-task-list");

    if(activeTaskList.children.length > 0) {
        activeTaskContainer.style.display = "block";
        activeTaskContainer.style.opacity = 1;
    } else {
        activeTaskContainer.style.display = "none";
        activeTaskContainer.style.opacity = 0;       
    }

    if(concludedTaskList.children.length > 0) {
        concludedTaskContainer.style.display = "block";
        concludedTaskContainer.style.opacity = 1;
    } else {
        concludedTaskContainer.style.display = "none";
        concludedTaskContainer.style.opacity = 0;       
    }
}

if(tasks.length > 0) {
    loadTasks();
}

showTasksContainer();

function showErrorMessage(text, time) {

    let errorMessage = document.getElementById("error-message");
    errorMessage.textContent = text;
    errorMessage.style.opacity = 1;

    setTimeout(() => {
        errorMessage.style.opacity = 0; 
    }, time);
}

function verifyTask(taskName, taskNameNormalized) {

    if(taskName.trim() === "") {
        showErrorMessage('Não é possível incluir uma tarefa sem nome.', 3000);
        return false;
    } 
    else if(tasks.length > 0) {
        for(let t of tasks) {
            if(taskNameNormalized === t.nameNormalized && t.isConcluded === false) {
                showErrorMessage('Já existe uma tarefa ativa com este nome. Tente incluir outra ou editar/concluir a existeste.', 5000);
                return false;
            }
        }
    }

    return true;
}

const taskInput = document.getElementById("task-input");
const taskInputMessage = document.getElementById("task-input-message");

function createTask() {

    let taskName = taskInput.value;
    let taskNameNormalized = normalizeText(taskName);
    let taskIsValid = verifyTask(taskName, taskNameNormalized);

    if(taskIsValid === true){

        let task = new Task(taskName, taskNameNormalized);
        tasks.push(task);

        const taskItem = createItem(taskName);        

        const activeTaskList = document.getElementById("active-task-list");
        activeTaskList.appendChild(taskItem);

        localStorage.setItem("tasks", JSON.stringify(tasks));    
        
        taskInput.value = '';

        showTasksContainer();
    }
}

taskInput.addEventListener('keydown', (e) => {
    
    let keyPressed = e.key;

    if(keyPressed === 'Enter') {
        createTask();
    }

    if(keyPressed === 'ArrowDown') {
        localStorage.clear();
        location.reload(true);
    }
});

const taskAddButton = document.getElementById('task-add-button');

taskAddButton.addEventListener('click', () => {
    createTask();
});

function concludeTask(concludeButton) {

    const taskItem = concludeButton.closest("li");
    const concludedTaskList = document.getElementById("concluded-task-list");

    concludedTaskList.appendChild(taskItem);
    taskItem.querySelector(".task-conclude-button").style.display = "none";

    showTasksContainer();
}

function removeTask(removeButton) {

    const taskItem = removeButton.closest('li');
    const taskEditInput = taskItem.querySelector("input");
    let taskName = taskEditInput.value;
    let taskNameNormalized = normalizeText(taskName);
    
    for(let t of tasks) {

        if(t.nameNormalized === taskNameNormalized) {
            tasks = tasks.filter(t => t.nameNormalized !== taskNameNormalized);
        }
    }

    taskItem.remove();

    localStorage.setItem("tasks", JSON.stringify(tasks)); 

    showTasksContainer();
}

function editTask(editButton) {

    const taskItem = editButton.closest('li');
    const taskEditInput = taskItem.querySelector("input");
    let taskName = taskEditInput.value;
    let taskNameNormalized = normalizeText(taskName);

    taskEditInput.removeAttribute("disabled");
    taskEditInput.select();

    function edit() {

        let taskNewName = taskEditInput.value;
        let taskNewNameNormalized = normalizeText(taskNewName);
        let taskIsValid = verifyTask(taskNewName, taskNewNameNormalized);

        if(taskIsValid === true) {

            for(let t of tasks) {

                if(taskNameNormalized === t.nameNormalized) {
                    t.name = taskNewName;
                    t.nameNormalized = taskNewNameNormalized;
                    taskEditInput.setAttribute("disabled", "true");
                    window.getSelection().removeAllRanges();
                    break;
                }
            }

            localStorage.setItem("tasks", JSON.stringify(tasks));;               
        } else {
            taskEditInput.value = taskName;
        }
    }

    function handleOutsideClick(event) {
        if(!taskEditInput.contains(event.target) && !editButton.contains(event.target)) {
            edit();
            document.removeEventListener('click', handleOutsideClick);
        }
    }

    taskEditInput.addEventListener('keydown', (e) => {

        let keyPressed = e.key;

        if(keyPressed === "Enter") {
            edit();
        }
    });

    document.addEventListener('click', handleOutsideClick);
}




