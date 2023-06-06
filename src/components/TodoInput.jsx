import React, { useState } from "react";
import "react-calendar/dist/Calendar.css";
import AddIcon from "@mui/icons-material/Add";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import "react-datetime/css/react-datetime.css";

import Datetime from "react-datetime";

function TodoInput(props) {
  const { onSubmitTodo, userId } = props;
  const [todoInput, setTodoInput] = useState("");
  const [showCalender, setShowCalender] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const addTodo = (event) => {
    setTodoInput(event.target.value);
  };

  const submitTodo = (event) => {
    event.preventDefault();
    console.log("submit todo");
    if (!todoInput) return;
    const todo = {
      todoValue: todoInput,
      isCompleted: false,
      userId,
      deadline: deadline ?? new Date().setHours(23, 59, 0, 0),
    };
    onSubmitTodo(todo);
    console.log(todo);
    setTodoInput("");
    setDate("");
    setTime("");
    setDeadline(null);
  };

  const renderInput = (_props, openCalendar, closeCalendar) => {
    return (
      <button
        className="alarmIcon"
        onClick={(event) => {
          event.preventDefault();
          console.log("render input");
          !showCalender ? openCalendar() : closeCalendar();
          setShowCalender((currentState) => !currentState);
        }}
      >
        <div>
          <div>{date}</div>
          <div>{time}</div>
        </div>
        <EventOutlinedIcon fontSize="medium" />
      </button>
    );
  };

  const setTaskDeadline = (dateTime) => {
    console.log("set task deadline");
    const date = new Date(dateTime).toLocaleDateString("en-GB");
    const time = new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });
    console.log(date);
    console.log(time);
    setDate(date);
    setTime(time);
    setDeadline(new Date(dateTime).getTime());
    // console.log(new Date(dateTime).getTime());
  };

  return (
    <div className="todoInput">
      <form onSubmit={submitTodo} className="todoInputForm">
        <input
          className="todoInputbox"
          type="text"
          value={todoInput}
          onChange={addTodo}
          placeholder="Enter a task"
        />
        <Datetime
          initialViewDate={new Date().setHours(23, 59, 0, 0)}
          dateFormat="DD-MM-YYYY"
          renderInput={renderInput}
          onChange={(moment) => setTaskDeadline(moment._d)} //setDeadline(new Date(moment._d)
        />

        <label className="addTodoButtonContainer">
          <input type="submit" value="Submit" className="addTodoButton" />
          <AddIcon fontSize="medium" />
        </label>
      </form>
    </div>
  );
}

export default TodoInput;
