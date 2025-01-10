import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "", // ✅ 비밀번호 확인 필드 추가
    name: "",
    login_method: "email",
  });
  

  const [error, setError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true); // ✅ 비밀번호 일치 여부

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // ✅ 비밀번호 & 비밀번호 확인 비교
    if (name === "confirmPassword" || name === "password") {
      setPasswordMatch(
        name === "confirmPassword"
          ? value === formData.password
          : formData.confirmPassword === value
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ 비밀번호 일치 여부 확인
    if (!passwordMatch) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      console.log("회원가입 요청 전송 중...", formData);

      const response = await fetch("https://moipzy.shop/app2/api/users/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          login_method: "email",
        }),
        mode: "cors",  // ✅ CORS 문제 해결
        credentials: "include",  // ✅ 쿠키/인증 정보 포함 (중요)
      });

      const responseData = await response.json();
      console.log("서버 응답:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "회원가입 실패");
      }

      alert("회원가입이 성공적으로 완료되었습니다!");
      navigate("/login");
    } catch (err) {
      console.error("회원가입 오류:", err.message);
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          회원가입
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
          <TextField
            fullWidth
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            variant="outlined"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            error={!passwordMatch} // ✅ MUI의 에러 스타일 적용
            helperText={!passwordMatch ? "비밀번호가 일치하지 않습니다." : ""}
          />
          <TextField
            fullWidth
            label="이름"
            name="name"
            type="text"
            variant="outlined"
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!passwordMatch} // ✅ 비밀번호가 다르면 버튼 비활성화
          >
            회원가입
          </Button>
        </form>
        <Button onClick={() => navigate("/login")} sx={{ mt: 1 }}>
          이미 계정이 있으신가요? 로그인
        </Button>
      </Box>
    </Container>
  );
}

export default SignUpPage;
