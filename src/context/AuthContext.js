import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("저장된 토큰 확인:", token);

    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token"); // ✅ LocalStorage에서 토큰 가져오기
      console.log("저장된 토큰 확인:", token);
  
      if (!token) {
        throw new Error("로그인 토큰이 없습니다.");
      }
  
      const response = await fetch("https://moipzy.shop/app2/api/users/me", {
        method: "GET",
        headers: { Authorization: token }, // ✅ Authorization 헤더 추가
      });
  
      if (!response.ok) {
        throw new Error("사용자 정보를 가져오지 못했습니다.");
      }
  
      const userData = await response.json();
      console.log("가져온 사용자 정보:", userData);
      setUser(userData);
    } catch (err) {
      console.error("사용자 정보 가져오기 실패:", err.message);
      localStorage.removeItem("token"); // ❌ 토큰이 유효하지 않으면 삭제
      setUser(null);
    }
  };
  

  const login = (token) => {
    localStorage.setItem("token", token);
    fetchUserProfile(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
