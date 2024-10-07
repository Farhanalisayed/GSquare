document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskTitle = document.getElementById('taskTitle');
    const taskList = document.getElementById('taskList');

    // Load tasks on page load
    loadTasks();

    // Handle form submission
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = taskTitle.value.trim();
        if (title) {
            addTask(title);
        }
        taskTitle.value = '';
    });

    // Load tasks from backend
    function loadTasks() {
        fetch('/tasks')
            .then(response => response.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    createTaskElement(task);
                });
            });
    }

    // Add task to the backend
    function addTask(title) {
        fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        })
        .then(response => response.json())
        .then(task => {
            createTaskElement(task);
        });
    }

    // Create task list element
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.classList.toggle('completed', task.status === 'completed');

        li.innerHTML = `
            <span class="status-${task.status.replace(" ", "-")}">${task.title}</span>
            <div>
                <button class="status-btn">Mark as Completed</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // Get the created buttons
        const markCompleteBtn = li.querySelector('.status-btn');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        // Disable the "Mark as Completed" button if the task is already completed
        if (task.status === 'completed') {
            markCompleteBtn.disabled = true;
        }

        // Add event listener to mark task as completed
        markCompleteBtn.addEventListener('click', () => {
            fetch(`/tasks/${task.id}/complete`, { method: 'PUT' })
                .then(response => response.json())
                .then(updatedTask => {
                    li.classList.add('completed');
                    markCompleteBtn.disabled = true;
                });
        });

        // Add event listener to edit task
        editBtn.addEventListener('click', () => {
            const taskSpan = li.querySelector('span');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskSpan.textContent;
            li.replaceChild(input, taskSpan);

            editBtn.textContent = 'Done';
            editBtn.addEventListener('click', () => {
                const newTitle = input.value.trim();
                if (newTitle) {
                    fetch(`/tasks/${task.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ title: newTitle })
                    })
                    .then(response => response.json())
                    .then(updatedTask => {
                        input.replaceWith(taskSpan);
                        taskSpan.textContent = updatedTask.title;
                        editBtn.textContent = 'Edit';
                    });
                }
            }, { once: true });
        });

        // Add event listener to delete task
        deleteBtn.addEventListener('click', () => {
            fetch(`/tasks/${task.id}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(() => {
                li.remove();
            });
        });

        taskList.appendChild(li);
    }
});
