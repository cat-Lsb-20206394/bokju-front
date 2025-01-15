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
  const [events, setEvents] = useState([]); // ✅ 캘린더 일정 상태 추가
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

    // ✅ 진행 중인 할 일 필터링 (기존 기능 유지)
    const ongoingTodos = data.todoAllData.filter((todo) => {
      const dueDate = todo.due_date ? new Date(todo.due_date) : null;
      return todo.status !== "completed" && dueDate && dueDate >= today;
    });

    setTodos(ongoingTodos);

    // ✅ 캘린더에 표시할 events 배열 추가 (KST 변환 후 하루 더 당김)
    const formattedEvents = data.todoAllData.map((todo) => {
      const dueDateUTC = new Date(todo.due_date);
      
      // ✅ UTC 시간을 한국 시간(KST)으로 변환
      const dueDateKST = new Date(
        dueDateUTC.getUTCFullYear(),
        dueDateUTC.getUTCMonth(),
        dueDateUTC.getUTCDate() - 1, // 📌 하루 더 당겨서 표시
        9, 0, 0, 0
      );

      // ✅ YYYY-MM-DD 형식으로 직접 변환
      const year = dueDateKST.getFullYear();
      const month = String(dueDateKST.getMonth() + 1).padStart(2, "0"); // 1월 = 0이므로 +1
      const day = String(dueDateKST.getDate()).padStart(2, "0");

      return {
        date: `${year}-${month}-${day}`, // 📌 변환된 날짜 (UTC → KST 후 하루 조정)
        title: todo.title, // 📌 일정 제목
        status: todo.status, // ✅ `status` 추가
      };
    });

    setEvents(formattedEvents); // ✅ 캘린더에서 사용할 일정 데이터 설정
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
        <Calendar
          onChange={handleDateChange}  // 📌 중복 선언 제거 후 정상 동작
          value={selectedDate}
          className="custom-calendar" 
          formatDay={(locale, date) => date.getDate()} // 📌 날짜에서 '일'을 제거
          // ✅ `events` 데이터를 캘린더에서 일정으로 표시 (완료된 일정 스타일 추가)
          tileContent={({ date, view }) => {
            if (view === "month") {
              const event = events.find(e => e.date === date.toISOString().split("T")[0]);
              return event ? (
                <div
                  className={`event-marker ${event.status === "completed" ? "event-marker-completed" : ""}`}
                  title={event.title}
                >
                  {event.title.length > 6 ? event.title.slice(0, 6) + "..." : event.title}
                </div>
              ) : null;
            }
          }}
        />
      </div>

      <div className="schedule-section">
        <h2>✅ 진행 중인 할 일</h2>
        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className="todo-item">
                📝 {todo.title} ( ~ {todo.due_date?.split("T")[0]})
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
              <li key={schedule._id} className="schedule-item">
                <span className="schedule-time">
                  {schedule.start_time?.slice(11, 16)} ~ {schedule.end_time?.slice(11, 16)}
                </span>
                <strong className="schedule-title">{schedule.title}</strong> 
              </li>
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
