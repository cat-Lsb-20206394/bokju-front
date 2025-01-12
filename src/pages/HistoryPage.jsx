import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [completedTodos, setCompletedTodos] = useState([]);
  const token = localStorage.getItem("token");

  const API_URL = "https://moipzy.shop/app2/api/todos/todo";

  // ✅ 완료된 할 일 목록 가져오기
  const fetchCompletedTodos = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("📌 서버에서 받은 전체 응답:", data);

      if (!data || !Array.isArray(data.todoAllData)) {
        console.error("🚨 완료된 할 일 목록이 존재하지 않음:", data);
        return;
      }

      // ✅ "completed" 상태인 할 일만 필터링
      const completedTasks = data.todoAllData.filter(todo => todo.status === "completed");
      console.log("✅ 완료된 할 일 목록:", completedTasks);
      setCompletedTodos(completedTasks);
      
    } catch (err) {
      console.error("완료된 할 일 목록 가져오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchCompletedTodos();
  }, [user, token]);

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
      <h2>완료된 할 일 목록</h2>
      <ul>
        {completedTodos.length > 0 ? (
          completedTodos.map(todo => (
            <li key={todo._id}>
              <span>{todo.title} ({todo.due_date?.split("T")[0]})</span>
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
