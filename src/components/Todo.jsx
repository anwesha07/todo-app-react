import React, { useState, useMemo, useEffect } from "react";
import "./stylesheets/todoStyles.css";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import TodayTodos from "./TodayTodos";
import ExpiredTodos from "./ExpiredTodos";
import UpcomingTodos from "./UpcomingTodos";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Todo(props) {
  const { signout, user } = props;
  const [isMenuActive, setMenuDisplay] = useState(false);
  const [page, setPage] = useState("today");
  const [worker, setWorker] = useState(null);

  // setup web worker

  useEffect(() => {
    // // Request permission for notifications
    // Notification.requestPermission();

    console.log("Notification" in window);
    console.log(Notification.permission);

    // create an instance of the web worker
    const newWorker = new Worker(new URL("../worker.js", import.meta.url));
    setWorker(newWorker);

    // Send a message to the web worker with the desired delay and message
    newWorker.postMessage({ message: "Web worker execution" });

    // Handle the message received from the web worker
    newWorker.addEventListener("message", (event) => {
      const message = event.data.message;
      console.log("Web worker message:", message);

      if (message === "todoExpired") {
        // notify in-app using react toastify
        toast.error(`${event.data.todo.todoValue}!`);

        if (Notification.permission === "granted") {
          // Create and show a notification
          const notification = new Notification("ToDo App", {
            body: `${event.data.todo.todoValue}!`,
          });

          // Handle notification click event
          notification.onclick = function () {
            setPage("today");
          };
        }
      }
    });

    return () => {
      // Terminate the web worker when the component unmounts
      newWorker.terminate();
      setWorker(null);
    };
  }, []);

  // ?. - Optional chaining
  // ?? - Nullish coalescing
  const firstName = useMemo(
    () => user?.displayName.split(" ")[0] ?? "",
    [user?.displayName]
  );

  const renderBody = () => {
    if (page === "expired") return <ExpiredTodos user={user} />;
    else if (page === "upcoming") return <UpcomingTodos user={user} />;
    else return <TodayTodos user={user} worker={worker} />;
  };

  return (
    <>
      <ToastContainer
        autoClose={false}
        theme="dark"
        style={{ opacity: "0.7", marginTop: "0.5em" }}
      />
      <div className="container">
        <div
          className={"content".concat(!isMenuActive ? " active" : "")}
          onClick={() => {
            if (isMenuActive) setMenuDisplay(false);
          }}
        >
          <></>
          <header className="header">
            <div>
              <h1>{`What's up, ${firstName}!`}</h1>
            </div>
            <button onClick={() => setMenuDisplay(true)}>
              <KeyboardArrowLeftOutlinedIcon />
            </button>
          </header>
          <div className="body"> {renderBody()} </div>
        </div>
        <div className={"menuContent".concat(isMenuActive ? " active" : "")}>
          <header className="menuHeader">
            <div className="closeMenuButtonContainer">
              <button onClick={() => setMenuDisplay(false)}>
                <KeyboardArrowRightOutlinedIcon />
              </button>
            </div>
            <div className="headerItemContainer">
              <div className="headerItem">
                <img src={user.photoURL} alt="You" />
              </div>
            </div>
            <div className="headerItemContainer">
              <div className="headerItem">
                <h2>{user.displayName}</h2>
              </div>
            </div>
          </header>
          <div className="menuBody">
            <div className="menuItemContainer">
              <div
                className="menuItem"
                onClick={() => {
                  setPage("today");
                  setMenuDisplay(false);
                }}
              >
                <TodayOutlinedIcon />
                <div className="menuItemText">Today's Tasks</div>
              </div>
            </div>
            <div className="menuItemContainer">
              <div
                className="menuItem"
                onClick={() => {
                  setPage("upcoming");
                  setMenuDisplay(false);
                }}
              >
                <AccessTimeOutlinedIcon />
                <div className="menuItemText">Upcoming Tasks</div>
              </div>
            </div>
            <div className="menuItemContainer">
              <div
                className="menuItem"
                onClick={() => {
                  setPage("expired");
                  setMenuDisplay(false);
                }}
              >
                <EventBusyOutlinedIcon />
                <div className="menuItemText">Expired tasks</div>
              </div>
            </div>
            <div className="menuItemContainer">
              <div className="menuItem" onClick={signout}>
                <PermIdentityOutlinedIcon />
                <div className="menuItemText">Sign out</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Todo;
