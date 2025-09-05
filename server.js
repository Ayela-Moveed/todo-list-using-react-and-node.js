import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [editInput, setEditInput] = useState("");
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [error, setError] = useState(false);
  const [editError, setEditError] = useState(false);

  // ✅ Fetch tasks from backend and log them
  useEffect(() => {
    axios.get("http://localhost:3000/todos")
      .then(res => {
        console.log("✅ Todos from backend:", res.data); // 👈 log todos
        setTasks(res.data);
      })
      .catch(err => console.error("❌ Error fetching todos:", err));
  }, []);

  // ✅ Add task
  const addTask = () => {
    if (!taskInput.trim()) {
      setError(true);
      return;
    }
    setError(false);

    axios.post("http://localhost:3000/todos", { task: taskInput })
      .then(res => {
        setTasks([...tasks, res.data]); // add new task from backend
        setTaskInput("");
      })
      .catch(err => console.error(err));
  };

  // ✅ Toggle task completion
  const toggleTask = (id, currentStatus) => {
    axios.put(`http://localhost:3000/todos/${id}`, { completed: !currentStatus })
      .then(() => {
        setTasks(tasks.map(t =>
          t.id === id ? { ...t, completed: !currentStatus } : t
        ));
      })
      .catch(err => console.error(err));
  };

  // ✅ Open edit modal
  const openEditModal = (task) => {
    setTaskToEdit(task);
    setEditInput(task.task);
    setEditError(false);
    setShowEditModal(true);
  };

  // ✅ Save edit
  const saveEdit = () => {
    if (!editInput.trim()) {
      setEditError(true);
      return;
    }

    axios.put(`http://localhost:3000/todos/${taskToEdit.id}`, { task: editInput })
      .then(() => {
        setTasks(tasks.map(t =>
          t.id === taskToEdit.id ? { ...t, task: editInput } : t
        ));
        setShowEditModal(false);
      })
      .catch(err => console.error(err));
  };

  // ✅ Delete task
  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:3000/todos/${taskToDelete.id}`)
      .then(() => {
        setTasks(tasks.filter(t => t.id !== taskToDelete.id));
        setShowDeleteModal(false);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="container">
      <h1>To-Do List</h1>

      {/* Add task */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
      >
        <input
          type="text"
          value={taskInput}
          onChange={(e) => {
            setTaskInput(e.target.value);
            setError(false);
          }}
          placeholder="Add a new task"
          className={error ? "error" : ""}
        />
        <button type="submit">Add</button>
        {error && <div className="error-message">Please enter a task!</div>}
      </form>

      {/* Task list */}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <label className="task-left">
              <input
                type="checkbox"
                checked={task.completed === 1}
                onChange={() => toggleTask(task.id, task.completed)}
              />
              <span className={`task-text ${task.completed ? "completed" : ""}`}>
                {task.task}
              </span>
            </label>
            <span className="actions">
              <button onClick={() => openEditModal(task)} title="Edit">✏</button>
              <button onClick={() => openDeleteModal(task)} title="Delete">🗑</button>
            </span>
          </li>
        ))}
      </ul>

      {/* Edit modal */}
      {showEditModal && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>Edit Task</h3>
            <input
              type="text"
              value={editInput}
              onChange={(e) => {
                setEditInput(e.target.value);
                setEditError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={editError ? "error" : ""}
            />
            {editError && <div className="modal-error">Please enter a task.</div>}
            <button onClick={saveEdit}>Save</button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>Are you sure you want to delete this task?</h3>
            <button onClick={confirmDelete}>Yes</button>
            <button onClick={() => setShowDeleteModal(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoApp;
