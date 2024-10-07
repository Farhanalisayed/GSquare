from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# In-memory storage for tasks
tasks = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET', 'POST'])
def manage_tasks():
    if request.method == 'POST':
        data = request.json
        task = {
            'id': len(tasks) + 1,
            'title': data['title'],
            'status': 'in progress'  # Default task status
        }
        tasks.append(task)
        return jsonify(task), 201
    elif request.method == 'GET':
        return jsonify(tasks)

@app.route('/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def update_task(task_id):
    task = next((task for task in tasks if task['id'] == task_id), None)
    if task is None:
        return jsonify({'error': 'Task not found'}), 404

    if request.method == 'PUT':
        data = request.json
        # Update title and/or status if provided
        if 'title' in data:
            task['title'] = data['title']
        if 'status' in data:
            task['status'] = data['status']
        return jsonify(task)

    elif request.method == 'DELETE':
        tasks.remove(task)
        return jsonify({'result': True})

# New route to handle marking a task as completed
@app.route('/tasks/<int:task_id>/complete', methods=['PUT'])
def complete_task(task_id):
    task = next((task for task in tasks if task['id'] == task_id), None)
    if task is None:
        return jsonify({'error': 'Task not found'}), 404
    
    # Update the task's status to 'completed'
    task['status'] = 'completed'
    return jsonify(task)

if __name__ == '__main__':
    app.run(debug=True)
