import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { AuthContext } from "../context/AuthContext";
import "./HomePage.css";

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜
  const [scheduleList, setScheduleList] = useState([]); // 일정 리스트
  const [todos, setTodos] = useState([]); // 진행 중인 Todo 리스트
  const token = localStorage.getItem("token");

  const SCHEDULE_API_URL = "https://moipzy.shop/app2/api/schedules";
  const TODO_API_URL = "https://moipzy.shop/app2/api/todos/todo";

  // ✅ 선택한 날짜의 일정 가져오기
  const fetchSchedules = async (date) => {
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
      if (!data || !Array.isArray(data.scheduleData)) return;

      // 선택한 날짜의 일정만 필터링
      const filteredSchedules = data.scheduleData.filter((schedule) => {
        return schedule.start_time.startsWith(date.toISOString().split("T")[0]);
      });

      setScheduleList(filteredSchedules);
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
    }
  };

  // ✅ 진행 중인 할 일 가져오기
  const fetchTodos = async () => {
    if (!user || !token) return;
  
    try {
      const response = await fetch(TODO_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);
  
      const data = await response.json();
      if (!data || !Array.isArray(data.todoAllData)) return;
  
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간 초기화 (날짜만 비교)
  
      // ✅ 완료되지 않고 마감일이 오늘 이후인 할 일만 필터링
      const ongoingTodos = data.todoAllData.filter((todo) => {
        const dueDate = todo.due_date ? new Date(todo.due_date) : null;
        return todo.status !== "completed" && dueDate && dueDate >= today;
      });
  
      setTodos(ongoingTodos);
    } catch (err) {
      console.error("할 일 목록 가져오기 실패:", err);
    }
  };
  

  // ✅ 날짜 선택 핸들러
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchSchedules(date);
  };

  // ✅ 페이지 처음 로드 시 일정과 할 일 불러오기
  useEffect(() => {
    fetchSchedules(selectedDate);
    fetchTodos(); // 할 일 목록도 불러옴
  }, [user, token]);

  return (
    <div className="homepage-container">
      <div className="calendar-section">
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>

      <div className="schedule-section">
        <h2>✅ 진행 중인 할 일</h2>
        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className="todo-item">
                📝 {todo.title} (〆 {todo.due_date?.split("T")[0]})
              </li>
            ))}
          </ul>
        ) : (
          <p>📌 진행 중인 할 일이 없습니다.</p>
        )}

        <h2>📅 {selectedDate.toISOString().split("T")[0]} 일정</h2>
        {scheduleList.length > 0 ? (
          <ul className="schedule-list">
            {scheduleList.map((schedule) => (
              <li key={schedule.id}>{schedule.title}</li>
            ))}
          </ul>
        ) : (
          <p>📌 일정이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
