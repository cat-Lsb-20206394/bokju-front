import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./SchedulePage.css";

const SchedulePage = () => {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // ✅ 일정 추가 / 편집 모드 구분
  const [newSchedule, setNewSchedule] = useState({ title: "", start_time: "", end_time: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const token = localStorage.getItem("token");

  const SCHEDULE_API_URL = "https://moipzy.shop/app2/api/schedules/schedule";

  // ✅ 선택한 날짜를 KST 기준 YYYY-MM-DD 형식으로 변환
  const formattedSelectedDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  })
    .format(selectedDate)
    .replace(/\. /g, "-")
    .replace(".", ""); // YYYY-MM-DD 형식 변환

  console.log("📌 선택한 날짜 (KST):", formattedSelectedDate);

  // ✅ 일정 목록 불러오기 (선택한 날짜의 일정만 필터링)
  const fetchSchedules = async () => {
    if (!user || !token) return;
    try {
      const response = await fetch(SCHEDULE_API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("일정 불러오기 실패");

      const data = await response.json();
      if (data.schedules && Array.isArray(data.schedules)) {
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
            .replace(".", ""); // YYYY-MM-DD 형식 변환

          return scheduleFormattedDate === formattedSelectedDate;
        });

        setSchedules(filteredSchedules);
      }
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [user, token, selectedDate]);

  const openPopup = (schedule = null) => {
    if (schedule) {
      setIsEditing(true);
  
      // ✅ 기존 일정의 날짜와 시간을 UTC → KST 변환 후 저장
      const scheduleStart = new Date(schedule.start_time);
      const scheduleEnd = new Date(schedule.end_time);
  
      // ✅ 첫 번째 수정 후, 다시 수정할 때 중복 변환 방지 (UTC 기준인지 확인)
      if (scheduleStart.getUTCHours() === scheduleStart.getHours()) {
        scheduleStart.setHours(scheduleStart.getHours() + 9); // UTC → KST 변환
        scheduleEnd.setHours(scheduleEnd.getHours() + 9); // UTC → KST 변환
      }
  
      const formattedDate = scheduleStart.toISOString().split("T")[0]; // YYYY-MM-DD 형식
  
      setSelectedDate(new Date(formattedDate)); // ✅ 수정 시 선택한 날짜를 유지
      setNewSchedule({
        title: schedule.title,
        start_time: scheduleStart.toISOString().slice(11, 16), // HH:MM 형식
        end_time: scheduleEnd.toISOString().slice(11, 16), // HH:MM 형식
        _id: schedule._id, // 편집할 일정의 ID 저장
      });
    } else {
      setIsEditing(false);
      setNewSchedule({ title: "", start_time: "", end_time: "" });
    }
    setShowPopup(true);
  };
  
  const saveSchedule = async () => {
    if (!newSchedule.title || !newSchedule.start_time || !newSchedule.end_time) {
      return alert("제목과 시간을 입력해주세요!");
    }
  
    try {
      const method = isEditing ? "PATCH" : "POST";
      const url = isEditing ? `${SCHEDULE_API_URL}/${newSchedule._id}` : SCHEDULE_API_URL;
  
      // ✅ 기존 값을 유지하기 위해 UTC → KST 변환 적용
      let startDate, endDate;
      
      if (isEditing) {
        const existingSchedule = schedules.find(sch => sch._id === newSchedule._id);
        
        if (newSchedule.start_time.includes(":")) {
          startDate = new Date(`${formattedSelectedDate}T${newSchedule.start_time}:00`);
        } else {
          startDate = new Date(existingSchedule.start_time);
          if (startDate.getUTCHours() === startDate.getHours()) {
            startDate.setHours(startDate.getHours() + 9); // UTC → KST 변환
          }
        }
  
        if (newSchedule.end_time.includes(":")) {
          endDate = new Date(`${formattedSelectedDate}T${newSchedule.end_time}:00`);
        } else {
          endDate = new Date(existingSchedule.end_time);
          if (endDate.getUTCHours() === endDate.getHours()) {
            endDate.setHours(endDate.getHours() + 9); // UTC → KST 변환
          }
        }
      } else {
        startDate = new Date(`${formattedSelectedDate}T${newSchedule.start_time}:00`);
        endDate = new Date(`${formattedSelectedDate}T${newSchedule.end_time}:00`);
      }
  
      // ✅ KST → UTC 변환 후 저장
      startDate.setHours(startDate.getHours() - 9);
      endDate.setHours(endDate.getHours() - 9);
  
      console.log("📌 최종 변환된 수정 시간 (UTC로 변환 후 전송):", {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      });
  
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: user?.id,
          title: newSchedule.title,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          status: "upcoming",
        }),
      });
  
      console.log("📌 응답 상태 코드:", response.status);
      const responseData = await response.json();
      console.log("📌 백엔드 응답 데이터:", responseData);
  
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} - ${responseData.message}`);
      }
  
      fetchSchedules();
      setShowPopup(false);
    } catch (err) {
      console.error("❌ 일정 수정 실패:", err);
      alert("일정 수정 중 오류가 발생했습니다.");
    }
  };
  

  // ✅ 일정 삭제
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
      <h2>📅 일정 관리</h2>

      {/* ✅ 날짜 선택 기능 */}
      <div className="date-selector">
        <label>📅 날짜 선택: </label>
        <input
          type="date"
          value={formattedSelectedDate}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>

      {/* ✅ 일정 추가 버튼 */}
      <button className="add-schedule-btn" onClick={() => openPopup()}>
        {formattedSelectedDate} 일정 추가
      </button>

      {/* ✅ 일정 목록 */}
      <ul className="schedule-list">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <li key={schedule._id} className="schedule-item">
              <span className="schedule-text">
                <strong>{schedule.title}</strong> 🕒 {schedule.start_time?.slice(11, 16)} ~ {schedule.end_time?.slice(11, 16)}
              </span>
              <div className="schedule-actions">
                {/* <button className="schedule-edit-btn" onClick={() => openPopup(schedule)}>
                  <FaEdit />
                </button> */}
                <button className="schedule-delete-btn" onClick={() => deleteSchedule(schedule._id)}>
                  <FaTrash />
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>📌 선택한 날짜에 등록된 일정이 없습니다.</p>
        )}
      </ul>

      {/* ✅ 일정 추가 / 편집 팝업 */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{isEditing ? "📌 일정 수정" : "📅 새 일정 추가"}</h3>
            <input type="text" placeholder="일정 제목" value={newSchedule.title} onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })} />
            <input type="time" value={newSchedule.start_time} onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })} />
            <input type="time" value={newSchedule.end_time} onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })} />
            <button onClick={saveSchedule}>{isEditing ? "수정 완료" : "추가"}</button>
            <button onClick={() => setShowPopup(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
