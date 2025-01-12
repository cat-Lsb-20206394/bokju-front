import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const TodoPage = () => {
  const { user } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  const API_URL = "https://moipzy.shop/app2/api/todos/todo";

  // ✅ 할 일 목록 가져오기
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

      console.log("✅ 변환된 할 일 목록:", data.todoAllData);
      setTodos(data.todoAllData); // 🎯 올바르게 설정
    } catch (err) {
      console.error("할 일 목록 가져오기 실패:", err);
    }
  };

  useEffect(() => {
    console.log("🔥 useEffect 실행됨! 사용자:", user, "토큰:", token);
    fetchTodos();
  }, [user, token]);

  // ✅ 할 일 추가 함수
  const addTodo = async () => {
    if (!newTodo || !dueDate) return alert("제목과 날짜를 입력해주세요!");

    const todoData = {
      title: newTodo,
      description,
      status: "Not done",
      due_date: new Date(dueDate).toISOString(),
      is_recurring: false,
      category: "일반",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) throw new Error("할 일 추가 실패");

      const newTask = await response.json();
      setTodos(prevTodos => [...prevTodos, newTask]); // ✅ 추가된 할 일 즉시 반영
      fetchTodos(); // ✅ 최신 목록 다시 불러오기

      setNewTodo("");
      setDueDate("");
      setDescription("");
    } catch (err) {
      console.error("할 일 추가 오류:", err);
    }
  };

  // ✅ 할 일 상태 변경 (체크박스)
  const toggleTodoStatus = async (_id, currentStatus) => {
    const updatedStatus = currentStatus === "Not done" ? "completed" : "Not done";

    try {
      const response = await fetch(`${API_URL}/${_id}`, {
        method: "PATCH",
        mode: "cors",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      if (!response.ok) throw new Error("상태 변경 실패");

      fetchTodos(); // ✅ 최신 목록 다시 불러오기
    } catch (err) {
      console.error("할 일 상태 변경 오류:", err);
    }
  };

  // ✅ 할 일 삭제
  const deleteTodo = async (_id) => {
    try {
      const response = await fetch(`${API_URL}/${_id}`, {
        method: "DELETE",
        mode: "cors",
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("할 일 삭제 실패");

      fetchTodos(); // ✅ 최신 목록 다시 불러오기
    } catch (err) {
      console.error("할 일 삭제 오류:", err);
    }
  };

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
      <h2>할 일 목록</h2>
      <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="할 일 제목" required />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명 (선택)" />
      <button onClick={addTodo}>추가</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <input type="checkbox" checked={todo.status === "completed"} onChange={() => toggleTodoStatus(todo._id, todo.status)} />
            <span>{todo.title} ({todo.due_date?.split("T")[0]}) - {todo.status}</span>
            <button onClick={() => deleteTodo(todo._id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoPage;
