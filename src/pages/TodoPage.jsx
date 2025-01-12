import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaEdit } from "react-icons/fa"; // ✅ 아이콘 추가
import "./TodoPage.css"; // ✅ CSS 적용

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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.todoAllData)) return;

      setTodos(data.todoAllData);
    } catch (err) {
      console.error("할 일 목록 가져오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user, token]);

  // ✅ 할 일 추가 함수
  const addTodo = async () => {
    if (!newTodo || !dueDate) return alert("제목과 날짜를 입력해주세요!");

    const todoData = {
      title: newTodo,
      description,
      status: "Not done",
      due_date: new Date(`${dueDate}T23:59:00Z`).toISOString(), // ✅ 23:59 기본값 설정
      is_recurring: false,
      category: "일반",
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(todoData),
      });

      fetchTodos();
      setNewTodo("");
      setDueDate("");
      setDescription("");
    } catch (err) {
      console.error("할 일 추가 오류:", err);
    }
  };

  // ✅ 할 일 상태 변경 (체크박스)
  const toggleTodoStatus = async (id, currentStatus) => {
    const updatedStatus = currentStatus === "Not done" ? "completed" : "Not done";

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo._id === id ? { ...todo, status: updatedStatus } : todo
        )
      );
    } catch (err) {
      console.error("할 일 상태 변경 오류:", err);
    }
  };

  // ✅ 할 일 수정 기능
  const editTodo = async (todo) => {
    const updatedTitle = prompt("새로운 제목을 입력하세요:", todo.title);
    const updatedDueDate = prompt("새로운 마감기한을 입력하세요 (YYYY-MM-DD):", todo.due_date?.split("T")[0]);
    const updatedDescription = prompt("새로운 메모를 입력하세요:", todo.description || "");

    if (!updatedTitle || !updatedDueDate) return;

    const updatedTodo = {
      title: updatedTitle,
      due_date: new Date(`${updatedDueDate}T23:59:00Z`).toISOString(),
      description: updatedDescription
    };

    try {
      await fetch(`${API_URL}/${todo._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedTodo),
      });

      fetchTodos();
    } catch (err) {
      console.error("할 일 수정 오류:", err);
    }
  };

  // ✅ 할 일 삭제
  const deleteTodo = async (_id) => {
    try {
      await fetch(`${API_URL}/${_id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      fetchTodos();
    } catch (err) {
      console.error("할 일 삭제 오류:", err);
    }
  };

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
    <div className="todo-container">
      <h2 className="todo-title">할 일 목록</h2>

      {/* ✅ 할 일 목록 (위에 배치) */}
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className="todo-item">
            {/* ✅ 체크박스 추가 */}
            <input
              type="checkbox"
              checked={todo.status === "completed"}
              onChange={() => toggleTodoStatus(todo._id, todo.status)}
            />

            <span className="todo-text">
              {todo.title} ({todo.due_date?.split("T")[0]})
              <br />
              <small className="todo-description">{todo.description || "메모 없음"}</small>c
            </span>
            <div className="todo-actions">
              <button className="todo-edit-btn" onClick={() => editTodo(todo)}>
                <FaEdit />
              </button>
              <button className="todo-delete-btn" onClick={() => deleteTodo(todo._id)}>
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* ✅ 추가 입력칸 (아래 배치) */}
      <div className="todo-add-section">
        <input type="text" className="todo-input" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="할 일 제목" required />
        <input type="date" className="todo-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        <input type="text" className="todo-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="메모 (선택)" />
        <button className="todo-button" onClick={addTodo}>추가</button>
      </div>
    </div>
  );
};

export default TodoPage;
