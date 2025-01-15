import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { AuthContext } from "../context/AuthContext";
import "./HomePage.css";

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date()); // ✅ 선택한 날짜
  const [scheduleList, setScheduleList] = useState([]); // ✅ 일정 리스트
  const [todos, setTodos] = useState([]); // ✅ 진행 중인 Todo 리스트
  const token = localStorage.getItem("token");

  const SCHEDULE_API_URL = "https://moipzy.shop/app2/api/schedules/schedule";
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
      console.log("📌 일정 데이터:", data); // ✅ 응답 데이터 확인

      if (!data || !Array.isArray(data.schedules)) {
        console.warn("📌 일정 데이터가 배열이 아닙니다:", data);
        return;
      }

      // ✅ 선택한 날짜를 KST 기준으로 변환
      const formattedDate = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Seoul",
      })
        .format(date)
        .replace(/\. /g, "-")
        .replace(".", ""); // YYYY-MM-DD 형식 변환

      console.log("📌 선택한 날짜 (KST):", formattedDate);

      // ✅ 일정의 `start_time`을 KST로 변환 후 비교
      const filteredSchedules = data.schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.start_time);
        const scheduleFormattedDate = new Intl.DateTimeFormat("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "Asia/Seoul",
        })
          .format(scheduleDate)
          .replace(/\. /g, "-")
          .replace(".", "");

        return scheduleFormattedDate === formattedDate;
      });

      setScheduleList(filteredSchedules);
    } catch (err) {
      console.error("❌ 일정 불러오기 실패:", err);
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
      console.log("📌 할 일 데이터:", data); // ✅ 응답 데이터 확인

      if (!data || !Array.isArray(data.todoAllData)) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ongoingTodos = data.todoAllData.filter((todo) => {
        const dueDate = todo.due_date ? new Date(todo.due_date) : null;
        return todo.status !== "completed" && dueDate && dueDate >= today;
      });

      setTodos(ongoingTodos);
    } catch (err) {
      console.error("❌ 할 일 목록 가져오기 실패:", err);
    }
  };

  // ✅ 날짜 선택 핸들러
  const handleDateChange = (date) => {
    setSelectedDate(date); // ✅ 날짜 업데이트
  };

  // ✅ `selectedDate`가 변경될 때마다 일정 다시 불러오기
  useEffect(() => {
    fetchSchedules(selectedDate);
  }, [selectedDate]);

  // ✅ `selectedDate`가 변경될 때마다 할 일 다시 불러오기
  useEffect(() => {
    if (user && token) {
      fetchTodos();
    }
  }, [user, token, selectedDate]); // ✅ 선택한 날짜가 변경될 때 실행

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

        <h2>📅 {new Intl.DateTimeFormat("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "Asia/Seoul",
        })
          .format(selectedDate)
          .replace(/\. /g, "-")
          .replace(".", "")} 일정</h2>

        {scheduleList.length > 0 ? (
          <ul className="schedule-list">
            {scheduleList.map((schedule) => (
              <li key={schedule._id || schedule.id}>{schedule.title}</li>
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
