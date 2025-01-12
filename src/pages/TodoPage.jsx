import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const TodoPage = () => {
  const { user } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  // ✅ 할 일 목록 가져오기
  useEffect(() => {
    if (!user) return;

    fetch("https://moipzy.shop/app2/api/todos", {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error("할 일 목록 가져오기 실패:", err));
  }, [user]);

  // ✅ 할 일 추가 함수
  const addTodo = async () => {
    if (!newTodo || !dueDate) return alert("제목과 날짜를 입력해주세요!");

    const todoData = {
      title: newTodo,
      description,
      status: "Not done",
      due_date: new Date(dueDate).toISOString(), // 날짜 변환
      is_recurring: false,
      category: "일반",
    };

    try {
      const response = await fetch("https://moipzy.shop/app2/api/todos", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) throw new Error("할 일 추가 실패");

      const newTask = await response.json();
      setTodos([...todos, newTask]); // UI 업데이트
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
      const response = await fetch(`https://moipzy.shop/app2/api/todos/${id}`, {
        method: "PATCH",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updatedStatus }),
      });

      if (!response.ok) throw new Error("상태 변경 실패");

      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, status: updatedStatus } : todo)));
    } catch (err) {
      console.error("할 일 상태 변경 오류:", err);
    }
  };

  // ✅ 할 일 삭제
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`https://moipzy.shop/app2/api/todos/${id}`, {
        method: "DELETE",
        mode: "cors",
      });

      if (!response.ok) throw new Error("할 일 삭제 실패");

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("할 일 삭제 오류:", err);
    }
  };

  // ✅ 로그인 안 한 경우 로그인 페이지로 이동 버튼 표시
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
      {/* ✅ 할 일 추가 입력 필드 */}
      <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="할 일 제목" required />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명 (선택)" />
      <button onClick={addTodo}>추가</button>

      {/* ✅ 할 일 목록 */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.status === "completed"}
              onChange={() => toggleTodoStatus(todo.id, todo.status)}
            />
            <span>
              {todo.title} ({todo.due_date?.split("T")[0]}) - {todo.status}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoPage;
