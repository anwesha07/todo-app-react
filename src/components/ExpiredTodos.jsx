import React, { useEffect, useState, useMemo } from "react";
import TodoDisplay from "./TodoDisplay";

import "./stylesheets/todoStyles.css";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config";

function ExpiredTodos(props) {
  const { user } = props;
  const [todos, setTodos] = useState([]);

  const sortedTodos = useMemo(() => {
    console.log(todos);
    return todos.toSorted((a, b) => (a.deadline >= b.deadline ? 1 : -1));
  }, [todos]);

  useEffect(() => {
    // fetch all todos that has expired
    const now = new Date().getTime();
    const prevTodos = [];

    const todosRef = collection(db, "todos");
    const q = query(
      todosRef,
      where("userId", "==", user.uid),
      where("deadline", "<=", now),
      orderBy("deadline")
    );

    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        prevTodos.push({ ...doc.data(), id: doc.id });
      });
      setTodos(prevTodos);
      console.log(prevTodos);
    });
  }, [user]);

  const updateTodo = async (newTodo) => {
    console.log(newTodo);
    try {
      const todoRef = doc(db, "todos", newTodo.id);
      await updateDoc(todoRef, {
        ...newTodo,
      });
      const updatedTodos = todos.map((todo) =>
        todo.id === newTodo.id ? newTodo : todo
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (todoToDelete) => {
    try {
      await deleteDoc(doc(db, "todos", todoToDelete.id));
      const updatedTodos = todos.filter((todo) => todo.id !== todoToDelete.id);
      setTodos(updatedTodos);
      console.log(updatedTodos);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="todoList">
        {todos.length ? (
          <h4 className="pendingHeader">YOUR EXPIRED TASKS:</h4>
        ) : (
          <h4 className="noTodoHeader">Ahh! No expired tasks to show!</h4>
        )}
        <div className="todos">
          {sortedTodos.map((todo) => (
            <TodoDisplay
              status={todo.isCompleted ? "pending" : "overdue"}
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

export default ExpiredTodos;
