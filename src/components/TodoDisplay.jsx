import React, { useRef, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function TodoDisplay(props) {
  const { todo: todoProp, updateTodo, onDeleteTodo, status } = props;
  const [todo, setTodo] = useState(todoProp);
  const [isEditing, setIsEditing] = useState(false);
  const [todoValue, setTodoValue] = useState(todoProp.todoValue);

  const inputRef = useRef();

  const onEdit = () => {
    if (isEditing) {
      console.log(todoValue);
      const updatedTodo = { ...todo, todoValue };
      console.log(updatedTodo);
      setTodo(updatedTodo);
      updateTodo(updatedTodo);
    } else {
      inputRef.current.focus();
    }
    setIsEditing((isEditing) => !isEditing);
  };

  const onChangeInput = (event) => {
    setTodoValue(event.target.value);
  };
  const handleChecked = () => {
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
    console.log(updatedTodo);
    setTodo(updatedTodo);
    updateTodo(updatedTodo);
  };
  const getClassName = () => {
    let className = "todoValue";
    if (isEditing) className = className.concat(" todoValueActive");
    if (todo.isCompleted) className = className.concat(" todoValueCompleted");
    console.log(className);
    return className;
  };
  const getEditButtonClassName = () => {
    let className = "editButton";
    if (isEditing) className = className.concat(" editButtonActive");
    if (todo.isCompleted) className = className.concat(" buttonCompleted");
    console.log(className);
    return className;
  };

  return (
    <div className={todo.isCompleted ? "todo todoValueCompleted" : "todo"}>
      <div className="todoContent">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={todo.isCompleted}
            onChange={handleChecked}
          />
        </label>
        <div>
          <input
            className={getClassName()}
            type="text"
            value={todoValue}
            readOnly={!isEditing}
            onChange={onChangeInput}
            ref={inputRef}
          />
          <div
            className={
              status === "overdue" ? "overdueDeadline" : "pendingDeadline"
            }
          >
            {todo.deadline < new Date().setHours(0, 0, 0, 0) ||
            todo.deadline > new Date().setHours(23, 59, 0, 0)
              ? `${new Date(todo.deadline).toLocaleDateString()}, ${new Date(
                  todo.deadline
                ).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}`
              : `${new Date(todo.deadline).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}`}
          </div>
        </div>
        <div className="buttonContainer">
          <button onClick={onEdit} className={getEditButtonClassName()}>
            <EditIcon />
            {/* {isEditing ? "Save" : "Edit"} */}
          </button>
          <button
            onClick={() => onDeleteTodo(todo)}
            className={
              todo.isCompleted ? "deleteButton buttonCompleted" : "deleteButton"
            }
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoDisplay;
