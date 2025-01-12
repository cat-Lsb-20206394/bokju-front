import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./HistoryPage.css"; // ✅ CSS 파일 불러오기

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");

  const API_URL = "https://moipzy.shop/app2/api/todos/todo";

  // ✅ 완료된 할 일 + 마감기한이 지난 할 일 목록 가져오기
  const fetchTodos = async () => {
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
        console.error("🚨 할 일 목록이 존재하지 않음:", data);
        return;
      }

      // ✅ 완료된 할 일 + 마감기한이 지난 할 일 필터링
      const today = new Date().toISOString().split("T")[0]; // 현재 날짜 (YYYY-MM-DD 형식)
      const filteredTasks = data.todoAllData.filter(todo => 
        todo.status === "completed" || (todo.due_date && todo.due_date.split("T")[0] < today)
      );

      console.log("✅ 필터링된 할 일 목록:", filteredTasks);
      setTodos(filteredTasks);
      
    } catch (err) {
      console.error("할 일 목록 가져오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user, token]);

  // ✅ 검색 기능 (title 또는 due_date 기준)
  const filteredTodos = todos.filter(todo => 
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (todo.due_date && todo.due_date.includes(searchQuery))
  );

  if (!user) {
    return (
      <div className="login-container">
        <h2>로그인이 필요합니다.</h2>
        <button className="login-button" onClick={() => (window.location.href = "/login")}>
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2 className="history-title">hm....</h2>
      
      {/* 🔍 검색창 추가 */}
      <input 
        type="text"
        placeholder="제목 또는 마감기한(YYYY-MM-DD) 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      <ul className="todo-list">
        {filteredTodos.length > 0 ? (
          filteredTodos.map(todo => (
            <li key={todo._id} className="todo-item">
              <span className="todo-text">
                {todo.title} ({todo.due_date?.split("T")[0]})
              </span>
              {todo.status !== "completed" && <span className="overdue">⚠️ 마감기한 초과</span>}
            </li>
          ))
        ) : (
          <p className="no-tasks">조건에 맞는 할 일이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default HistoryPage;
