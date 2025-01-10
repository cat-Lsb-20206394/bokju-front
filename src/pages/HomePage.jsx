import React from "react";
import "./HomePage.css"; // CSS 파일로 반응형 적용

function HomePage() {
  return (
    <div className="home-container">
      {/* 왼쪽 (캘린더 자리 - 나중에 API 추가) */}
      <div className="calendar-box">
        <h3>Calender</h3>
      </div>

      {/* 오른쪽 (오늘 일정) */}
      <div className="schedule-box">
        <h3>Today 12/31</h3>
        <p>일정 리스트 (읽기 전용)</p>
      </div>
    </div>
  );
}

export default HomePage;
