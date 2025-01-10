import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      console.log("로그인 요청 전송 중...", formData);
  
      // ✅ 로그인 API 요청
      const response = await fetch("https://moipzy.shop/app2/api/users/email-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify({ email: "example1@naver.com", password: "1234" }),
        body: JSON.stringify(formData),
        mode: "cors",  // ✅ CORS 문제 방지
        credentials: "include",  // ✅ 필요한 경우 쿠키 포함
      });
  
      console.log("서버 응답 헤더:", [...response.headers.entries()]); // ✅ 모든 헤더 출력
  
      // ✅ `Authorization` 헤더에서 JWT 토큰 추출
      const authHeader = response.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("서버 응답에 Authorization 헤더가 없습니다.");
      }
  
      const token = authHeader.replace("Bearer ", "");
      console.log("추출된 JWT Token:", token);
  
      // ✅ 토큰을 로컬 스토리지에 저장
      localStorage.setItem("token", token);
      console.log("저장된 토큰:", localStorage.getItem("token"));
  
      // ✅ JSON 응답 파싱 (사용자 정보 가져오기)
      const data = await response.json();
      console.log("User:", data.user);
  
      navigate("/"); // 로그인 성공 후 홈 화면으로 이동
    } catch (err) {
      console.error("로그인 중 오류:", err.message);
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    }
  };
  
  

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          로그인
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="이메일"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            로그인
          </Button>
        </form>
        <Button onClick={() => navigate("/signup")} sx={{ mt: 1 }}>
          계정이 없으신가요? 회원가입
        </Button>
      </Box>
    </Container>
  );
}

export default LoginPage;
