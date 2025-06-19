
const taskText = document.getElementById('taskText');
const taskDate = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.task-filters button');

let tasks = [];
let currentFilter = 'all';

function getTasks() {
  const data = localStorage.getItem('tasks');
  return data ? JSON.parse(data) : [];
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = currentFilter) {
  taskList.innerHTML = '';
  let filtered = [...tasks];

  if (filter === 'completed') {
    filtered = tasks.filter(t => t.completed);
  } else if (filter === 'active') {
    filtered = tasks.filter(t => !t.completed);
  } else if (filter === 'sort') {
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.setAttribute('data-id', task.id);
    li.innerHTML = `
      <span><strong>${task.text}</strong> - ${task.dueDate}</span>
      <div>
        <button class="list_buttons" onclick="toggleTask('${task.id}')">${task.completed ? 'בטל השלמה' : 'סמן כהושלם'}
        </button>
        <button class="trash" onclick="deleteTask('${task.id}')"> <img src="trash.webp" alt="Delete"
        width="15" height="15">
        </button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskText.value.trim();
  const dueDate = taskDate.value;
  const today = new Date().toISOString().split('T')[0];

  if (!text || !dueDate) {
    alert('יש צורך בכיתבת תאריך');
    return;
  }

  if (dueDate < today) {
    alert('לא ניתן להזין תאריך אחורה מהיום הנוכחי');
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    text,
    dueDate,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderSingleTask(newTask);

  taskText.value = '';
  taskDate.value = '';
}

function renderSingleTask(task) {
  const li = document.createElement('li');
  li.className = 'fade-in';
  li.setAttribute('data-id', task.id);
  li.innerHTML = `
    <span><strong>${task.text}</strong> - ${task.dueDate}</span>
    <div>
      <button onclick="toggleTask('${task.id}')">${task.completed ? 'בטל השלמה' : 'סמן כהושלם'}</button>
      <button onclick="deleteTask('${task.id}')"><img src="trash.png" alt="Delete"
        width="15" height="15">
        </button>
    </div>
  `;
  taskList.appendChild(li);
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    const confirmDelete = confirm(`האם אתה בטוח שברצונך למחוק את המשימה "${task.text}"?`);
    if (!confirmDelete) return;
  }

  const index = tasks.findIndex(t => t.id === id);
  if (index > -1) {
    tasks.splice(index, 1);
    saveTasks();
    const li = taskList.querySelector(`li[data-id='${id}']`);
    if (li) {
      li.classList.add('fade-in');
      li.style.opacity = 0;
      setTimeout(() => li.remove(), 300);
    }
  }
}

function fetchInitialTasks() {
  const fetchedFlag = localStorage.getItem('fetchedInitial');
  if (fetchedFlag) return;

  fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
    .then(response => response.json())
    .then(data => {
      const imported = data.map(item => ({
        id: 'api-' + item.id.toString(),
        text: item.title,
        dueDate: new Date().toISOString().split('T')[0],
        completed: item.completed
      }));
      tasks = [...imported, ...tasks];
      localStorage.setItem('fetchedInitial', 'true');
      saveTasks();
      renderTasks();
    });
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter || button.innerText;
    if (currentFilter === selected) {
      currentFilter = 'all';
      filterButtons.forEach(btn => btn.classList.remove('active'));
    } else {
      currentFilter = selected;
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    }
    renderTasks(currentFilter);
  });
});

addTaskBtn.addEventListener('click', addTask);

tasks = getTasks();
fetchInitialTasks();
renderTasks();
