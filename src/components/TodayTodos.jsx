import React, { useEffect, useState, useMemo } from "react";
import TodoDisplay from "./TodoDisplay";
import TodoInput from "./TodoInput";
import "./stylesheets/todoStyles.css";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config";

function TodayTodos(props) {
  const { user, worker } = props;
  const [todos, setTodos] = useState([]);
  const [pendingTodos, setPendingTodos] = useState([]);
  const [overdueTodos, setOverdueTodos] = useState([]);

  useEffect(() => {
    //fetch the todos
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 0, 0);
    // console.log({ todayStart, todayEnd });
    const existingTodos = [];

    const todosRef = collection(db, "todos");
    const q1 = query(
      todosRef,
      where("userId", "==", user.uid),
      where("deadline", ">=", todayStart),
      where("deadline", "<=", todayEnd),
      orderBy("deadline")
    );

    getDocs(q1).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        existingTodos.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      setTodos(existingTodos);
      if (worker) {
        worker.postMessage({
          message: "startTimer",
          todos: existingTodos,
          date: todayStart,
        });

        worker.addEventListener("message", (event) => {
          const message = event.data.message;
          if (message === "Todo Expired") {
            setOverdueTodos((prevOverdueTodos) => [
              ...prevOverdueTodos,
              event.data.todo,
            ]);
            setPendingTodos((prevPendingTodos) =>
              prevPendingTodos.filter((todo) => todo.id !== event.data.todo.id)
            );
          }
        });
      }
      // console.log(existingTodos);
    });
  }, [user, worker]);

  const sortedTodos = useMemo(() => {
    // console.log(todos);
    return todos.toSorted((a, b) => {
      if (a.isCompleted === b.isCompleted) {
        return a.deadline >= b.deadline ? 1 : -1;
      } else if (a.isCompleted) {
        return 1;
      } else {
        return -1;
      }
    });
  }, [todos]);

  useEffect(() => {
    const currentTime = new Date().getTime();
    console.log(
      sortedTodos.filter(
        (todo) => !todo.isCompleted && todo.deadline <= currentTime
      )
    );
    setOverdueTodos(
      sortedTodos.filter(
        (todo) => !todo.isCompleted && todo.deadline <= currentTime
      )
    );
    setPendingTodos(
      sortedTodos.filter(
        (todo) => todo.isCompleted || todo.deadline > currentTime
      )
    );
  }, [sortedTodos]);

  const onSubmitTodo = async (newTodo) => {
    try {
      const docRef = await addDoc(collection(db, "todos"), {
        ...newTodo,
      });

      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayEnd = new Date().setHours(23, 59, 0, 0);
      if (newTodo.deadline >= todayStart && newTodo.deadline <= todayEnd) {
        newTodo.id = docRef.id;
        setTodos((prevTodos) => {
          return [...prevTodos, newTodo];
        });
      }
      console.log("Document written with ID: ", docRef.id);
      if (worker) {
        worker.postMessage({
          message: "addTodo",
          todo: newTodo,
        });
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateTodo = async (newTodo) => {
    // console.log(newTodo);
    try {
      const todoRef = doc(db, "todos", newTodo.id);
      // eslint-disable-next-line no-unused-vars
      const { id, ...newTodoToUpdate } = newTodo;
      await updateDoc(todoRef, newTodoToUpdate);
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === newTodo.id ? newTodo : todo))
      );
      if (worker) {
        worker.postMessage({
          message: "updateTodo",
          todo: newTodo,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (todoToDelete) => {
    try {
      await deleteDoc(doc(db, "todos", todoToDelete.id));
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo.id !== todoToDelete.id)
      );

      if (worker) {
        worker.postMessage({
          message: "deleteTodo",
          todo: todoToDelete,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <TodoInput onSubmitTodo={onSubmitTodo} userId={user.uid} />

      <div className="todoList">
        {overdueTodos.length === 0 && pendingTodos.length === 0 ? (
          <h4 className="noTodoHeader">All set! No tasks for today!</h4>
        ) : null}
        {overdueTodos.length ? (
          <h4 className="overdueHeader">OVERDUE:</h4>
        ) : null}
        <div className="todos">
          {overdueTodos.map((todo) => (
            <TodoDisplay
              status="overdue"
              todo={todo}
              updateTodo={(updatedTodo) => updateTodo(updatedTodo)}
              onDeleteTodo={(todoToDelete) => deleteTodo(todoToDelete)}
              key={todo.id}
            />
          ))}
        </div>
        {pendingTodos.length ? (
          <h4 className="pendingHeader">TODAY'S TASKS:</h4>
        ) : null}
        <div className="todos">
          {pendingTodos.map((todo) => (
            <TodoDisplay
              status="pending"
              todo={todo}
              updateTodo={(updatedTodo) => updateTodo(updatedTodo)}
              onDeleteTodo={(todoToDelete) => deleteTodo(todoToDelete)}
              key={todo.id}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default TodayTodos;
