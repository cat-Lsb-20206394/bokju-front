import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./SchedulePage.css";

const SchedulePage = () => {
  const { user } = useContext(AuthContext);
  const [todos, setTodos] = useState([]); // 진행 중인 Todo 리스트
  const [schedules, setSchedules] = useState([]); // 일정 리스트
  const [showPopup, setShowPopup] = useState(false); // 일정 추가 팝업 상태
  const [newSchedule, setNewSchedule] = useState({ title: "", start_time: "", end_time: "" }); // 새 일정 데이터
  const token = localStorage.getItem("token");

  const TODO_API_URL = "https://moipzy.shop/app2/api/todos/todo";
  const SCHEDULE_API_URL = "https://moipzy.shop/app2/api/schedules/schedule";

  // ✅ 진행 중인 할 일 가져오기
  const fetchTodos = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(TODO_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);

      const data = await response.json();
      if (!data || !Array.isArray(data.todoAllData)) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ongoingTodos = data.todoAllData.filter((todo) => {
        const dueDate = todo.due_date ? new Date(todo.due_date) : null;
        return todo.status !== "completed" && dueDate && dueDate >= today;
      });

      setTodos(ongoingTodos);
    } catch (err) {
      console.error("할 일 목록 가져오기 실패:", err);
    }
  };

  // ✅ 모든 일정 가져오기 (_id 사용)
  const fetchSchedules = async () => {
    if (!user || !token) return;
  
    try {
      const response = await fetch(SCHEDULE_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);
  
      const data = await response.json();
  
      console.log("📌 받아온 일정 데이터:", data);
  
      // ✅ 올바른 속성 선택 (data.schedules 사용)
      if (data.schedules && Array.isArray(data.schedules)) {
        setSchedules(data.schedules);
      } else {
        console.warn("❌ 일정 데이터가 배열이 아닙니다:", data);
      }
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
    }
  };
  

  useEffect(() => {
    fetchTodos();
    fetchSchedules();
  }, [user, token]);

  // ✅ 새 일정 추가 (_id 없음)
  const addSchedule = async () => {
    if (!newSchedule.title || !newSchedule.start_time || !newSchedule.end_time) {
      return alert("제목과 시간을 입력해주세요!");
    }
  
    try {
      await fetch(SCHEDULE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          title: newSchedule.title,
          description: newSchedule.description || "",
          start_time: newSchedule.start_time,
          end_time: newSchedule.end_time,
          status: "upcoming",
        }),
      });
  
      console.log("✅ 일정이 추가되었습니다. 새 목록을 불러옵니다...");
      
      fetchSchedules();  // ✅ 일정 추가 후 목록 다시 불러오기
      setShowPopup(false);
      setNewSchedule({ title: "", start_time: "", end_time: "" });
    } catch (err) {
      console.error("일정 추가 실패:", err);
    }
  };
  

  // ✅ 일정 삭제 (_id 사용)
  const deleteSchedule = async (_id) => {
    try {
      await fetch(`${SCHEDULE_API_URL}/${_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchSchedules();
    } catch (err) {
      console.error("일정 삭제 실패:", err);
    }
  };

  return (
    <div className="schedule-container">
      {/* 왼쪽: 진행 중인 To-Do */}
      <div className="todo-section">
        <h2>📌 진행 중인 할 일</h2>
        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id}>📝 {todo.title} (〆 {todo.due_date?.split("T")[0]})</li>
            ))}
          </ul>
        ) : (
          <p>📌 진행 중인 할 일이 없습니다.</p>
        )}
      </div>

      {/* 오른쪽: 일정 관리 */}
      <div className="schedule-section">
        <h2>📅 일정 목록</h2>
        <button className="add-schedule-btn" onClick={() => setShowPopup(true)}>+ 일정 추가</button>

        {schedules.length > 0 ? (
          <ul className="schedule-list">
            {schedules.map((schedule) => (
              <li key={schedule._id}>
                {schedule.title} ({schedule.start_time.split("T")[0]})
                <button className="delete-btn" onClick={() => deleteSchedule(schedule._id)}>🗑️</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>📌 등록된 일정이 없습니다.</p>
        )}
      </div>

      {/* 일정 추가 팝업 */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>📅 새 일정 추가</h3>
            <input type="text" placeholder="일정 제목" value={newSchedule.title} onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })} />
            <input type="datetime-local" value={newSchedule.start_time} onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })} />
            <input type="datetime-local" value={newSchedule.end_time} onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })} />
            <button onClick={addSchedule}>추가</button>
            <button onClick={() => setShowPopup(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
