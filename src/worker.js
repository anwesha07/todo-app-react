/* eslint-disable no-restricted-globals */

let todos = [];
let today;
let interval;
const timerMap = new Map();
const timegap = 5 * 60 * 1000;

const setTimers = () => {
  todos.forEach((todo) => {
    // check if timer is already set for this todo
    if (timerMap.get(todo.id)) return;

    // else set the timer
    const currentTime = new Date();
    if (todo.deadline >= currentTime) {
      const timeout = setTimeout(() => {
        self.postMessage({ message: "todoExpired", todo });
        timerMap.delete(todo.id);
      }, todo.deadline - currentTime);
      console.log(`timeout applied on ${todo.todoValue}`);
      timerMap.set(todo.id, timeout);
    }
  });
};

self.onmessage = function (event) {
  const message = event.data.message;
  console.log(`Received message: ${message}`);
  // self.postMessage({ message: "Worker started" });

  if (message === "startTimer") {
    const date = event.data.date;
    if (today && date === today) return;
    today = date;
    todos = event.data.todos;
    console.log(todos, today);
    setTimers();
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      setTimers();
    }, timegap);
  }
  if (message === "addTodo") {
    const currentTime = new Date();
    const todo = event.data.todo;
    todos.push(todo);
    if (todo.deadline - currentTime <= timegap) {
      const timeout = setTimeout(() => {
        self.postMessage({ message: "todoExpired", todo });
      }, todo.deadline - currentTime);
      console.log(`timeout applied on ${todo.todoValue}`);
      timerMap.set(todo.id, timeout);
    }
  }

  if (message === "updateTodo") {
    const todo = event.data.todo;

    // update the todo in todos array
    todos = todos.map((existingTodo) =>
      existingTodo.id === todo.id ? todo : existingTodo
    );
    const existingTimer = timerMap.get(todo.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      const currentTime = new Date();
      if (todo.deadline - currentTime > 0) {
        const newTimer = setTimeout(() => {
          self.postMessage({ message: "todoExpired", todo });
        }, todo.deadline - currentTime);
        timerMap.set(todo.id, newTimer);
      }
    }
  }

  if (message === "deleteTodo") {
    const todo = event.data.todo;

    // delete it from the todos array
    todos = todos.filter((existingTodo) => existingTodo.id !== todo.id);
    const existingTimer = timerMap.get(todo.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
  }
};
