import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaEdit } from "react-icons/fa"; 
import "./TodoPage.css";

const TodoPage = () => {
  const { user } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [showPopup, setShowPopup] = useState(false); // ✅ 할 일 추가 팝업 상태
  const [showEditPopup, setShowEditPopup] = useState(false); // ✅ 할 일 편집 팝업 상태
  const [newTodo, setNewTodo] = useState(""); // ✅ 새 할 일 제목
  const [dueDate, setDueDate] = useState(""); // ✅ 새 할 일 마감기한
  const [description, setDescription] = useState(""); // ✅ 새 할 일 설명
  const [editTodo, setEditTodo] = useState(null); // ✅ 편집할 할 일 정보
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

  // ✅ 할 일 추가
  const addTodo = async () => {
    if (!newTodo || !dueDate) return alert("제목과 날짜를 입력해주세요!");

    try {
      const todoData = {
        title: newTodo,
        description,
        status: "Not done",
        due_date: new Date(`${dueDate}T23:59:00Z`).toISOString(),
        is_recurring: false,
        category: "일반",
      };

      await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(todoData),
      });

      fetchTodos();
      setShowPopup(false);
      setNewTodo("");
      setDueDate("");
      setDescription("");
    } catch (err) {
      console.error("할 일 추가 오류:", err);
    }
  };

  // ✅ 편집 팝업 열기
  const openEditPopup = (todo) => {
    console.log("🛠 편집 버튼 클릭:", todo);
    if (!todo) return;

    setEditTodo({
      ...todo,
      due_date: todo.due_date ? todo.due_date.split("T")[0] : "", // 날짜 형식 변환
    });

    setShowEditPopup(true);
  };

  // ✅ 편집 팝업 닫기
  const closeEditPopup = () => {
    setShowEditPopup(false);
    setEditTodo(null);
  };

  // ✅ 할 일 수정
  const updateTodo = async () => {
    if (!editTodo || !editTodo._id) return alert("수정할 할 일을 찾을 수 없습니다.");

    try {
      await fetch(`${API_URL}/${editTodo._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTodo.title,
          description: editTodo.description,
          due_date: new Date(`${editTodo.due_date}T23:59:00Z`).toISOString(),
          status: editTodo.status,
        }),
      });

      fetchTodos();
      closeEditPopup();
    } catch (err) {
      console.error("할 일 수정 오류:", err);
    }
  };

  // ✅ 할 일 완료 여부 변경 (체크박스)
  const toggleTodoStatus = async (todo) => {
    const updatedStatus = todo.status === "Not done" ? "completed" : "Not done";

    try {
      await fetch(`${API_URL}/${todo._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      fetchTodos();
    } catch (err) {
      console.error("할 일 상태 변경 오류:", err);
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
  // ✅ 오늘 날짜 기준으로 마감기한을 비교하여 그룹화
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ongoingTodos = todos.filter(todo => 
    todo.status !== "completed" && new Date(todo.due_date) >= today
  );
  const expiredTodos = todos.filter(todo => 
    todo.status !== "completed" && new Date(todo.due_date) < today
  );
  const completedTodos = todos.filter(todo => todo.status === "completed");

  return (
    <div className="todo-container">
      <h2 className="todo-title">할 일 목록</h2>

      <button className="add-todo-button" onClick={() => setShowPopup(true)}>
        할 일 추가
      </button>

      {/* ✅ 진행 중인 할 일 */}
      <h3>🔹 진행 중인 할 일</h3>
      <ul className="todo-list">
        {ongoingTodos.map((todo) => (
          <li key={todo._id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.status === "completed"}
              onChange={() => toggleTodoStatus(todo)}
            />
            <span className="todo-text">{todo.title} (~ {todo.due_date?.split("T")[0]})</span>
            <div className="todo-actions">
              <button className="todo-edit-btn" onClick={() => openEditPopup(todo)}>
                <FaEdit />
              </button>
              <button className="todo-delete-btn" onClick={() => deleteTodo(todo._id)}>
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* ✅ 마감 기한이 지난 할 일 */}
      <h3>⚠️ 마감 기한 지난 할 일</h3>
      <ul className="todo-list expired">
        {expiredTodos.map((todo) => (
          <li key={todo._id} className="todo-item expired">
            <input
              type="checkbox"
              checked={todo.status === "completed"}
              onChange={() => toggleTodoStatus(todo)}
            />
            <span className="todo-text">{todo.title} (~ {todo.due_date?.split("T")[0]})</span>
            <div className="todo-actions">
              <button className="todo-edit-btn" onClick={() => openEditPopup(todo)}>
                <FaEdit />
              </button>
              <button className="todo-delete-btn" onClick={() => deleteTodo(todo._id)}>
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* ✅ 완료된 할 일 */}
      <h3>✅ 완료된 할 일</h3>
      <ul className="todo-list completed">
        {completedTodos.map((todo) => (
          <li key={todo._id} className="todo-item completed">
            <input
              type="checkbox"
              checked={true}
              onChange={() => toggleTodoStatus(todo)}
            />
            <span className="todo-text">{todo.title} (~ {todo.due_date?.split("T")[0]})</span>
            <div className="todo-actions">
              <button className="todo-edit-btn" onClick={() => openEditPopup(todo)}>
                <FaEdit />
              </button>
              <button className="todo-delete-btn" onClick={() => deleteTodo(todo._id)}>
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* 📌 할 일 추가 팝업 */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>할 일 추가</h3>
            <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="할 일 제목" required />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="메모" />
            <button onClick={addTodo}>추가</button>
            <button onClick={() => setShowPopup(false)}>취소</button>
          </div>
        </div>
      )}
      {/* 📌 편집 팝업 */}
      {showEditPopup && editTodo && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>할 일 수정</h3>
            <input
              type="text"
              className="todo-input"
              value={editTodo.title}
              onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
              placeholder="할 일 제목"
            />
            <input
              type="date"
              className="todo-input"
              value={editTodo.due_date}
              onChange={(e) => setEditTodo({ ...editTodo, due_date: e.target.value })}
            />
            <textarea
              className="todo-input"
              value={editTodo.description}
              onChange={(e) => setEditTodo({ ...editTodo, description: e.target.value })}
              placeholder="메모"
            />
            <button className="todo-button" onClick={updateTodo}>수정 완료</button>
            <button className="todo-button cancel" onClick={closeEditPopup}>취소</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TodoPage;