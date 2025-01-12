import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [completedTodos, setCompletedTodos] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetch("https://moipzy.shop/app2/api/todos", {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const completedTasks = data.filter((todo) => todo.status === "completed");
        setCompletedTodos(completedTasks);
      })
      .catch((err) => console.error("완료된 할 일 목록 가져오기 실패:", err));
  }, [user]);

  if (!user) {
    return (
      <div>
        <h2>로그인이 필요합니다.</h2>
        <button onClick={() => (window.location.href = "/login")}>로그인 페이지로 이동</button>
      </div>
    );
  }

  return (
    <div>
      <h2>완료된 할 일</h2>
      <ul>
        {completedTodos.length > 0 ? (
          completedTodos.map((todo) => (
            <li key={todo.id}>
              <span>{todo.title} - 완료일: {new Date(todo.due_date).toLocaleDateString()}</span>
            </li>
          ))
        ) : (
          <p>완료된 할 일이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default HistoryPage;
