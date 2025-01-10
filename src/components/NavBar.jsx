import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, IconButton, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import "./NavBar.css"; 

function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation(); // 현재 페이지의 URL 정보를 가져옴
  const { user, logout } = useContext(AuthContext);

  // 📌 URL에 따라 동적으로 페이지 제목 변경
  const pageTitles = {
    "/": "Home",
    "/todo": "To-Do List",
    "/schedule": "Schedule",
    "/history": "History",
    "/login": "Login",
    "/signup": "Sign Up",
  };

  const pageTitle = pageTitles[location.pathname] || "Page";

  return (
    <div className="navbar">
      {/* 왼쪽: 햄버거 메뉴 버튼 */}
      <IconButton onClick={() => setOpen(true)} className="nav-icon">
        <MenuIcon />
      </IconButton>

      {/* 가운데: 페이지 제목 */}
      <h2 className="nav-title">{pageTitle}</h2>

      <nav>
        {user ? (
          <>
          <span>{user.name}님 </span>
            {/* <button onClick={logout}>로그아웃</button> */}
          </>
        ) : (
          <Link to="/login">로그인</Link>
        )}
      </nav>
      
      {/* 오른쪽: 홈 아이콘 (클릭 시 Home 이동) */}
      <IconButton component={Link} to="/" className="nav-icon">
        <HomeIcon />
      </IconButton>

      {/* 네비게이션 바 (Drawer) */}
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <div className="nav-drawer">
          <List className="nav-list">
            <ListItem button component={Link} to="/" onClick={() => setOpen(false)}>
              <ListItemText primary="Home" sx={{ color: "black !important" }}/>
            </ListItem>
            <ListItem button component={Link} to="/todo" onClick={() => setOpen(false)}>
              <ListItemText primary="Todo" sx={{ color: "black !important" }}/>
            </ListItem>
            <ListItem button component={Link} to="/schedule" onClick={() => setOpen(false)}>
              <ListItemText primary="Schedule" sx={{ color: "black !important" }}/>
            </ListItem>
            <ListItem button component={Link} to="/history" onClick={() => setOpen(false)}>
              <ListItemText primary="History" sx={{ color: "black !important" }}/>
            </ListItem>
          </List>

          {/* 구분선 추가 */}
          <Divider />

          {/* 로그인 / 회원가입 버튼 (하단 고정) */}
          <div className="nav-bottom">
            {!user ? ( // ✅ 로그인 상태가 아니면 로그인 & 회원가입 버튼 표시
              <>
                <ListItem button component={Link} to="/login" onClick={() => setOpen(false)}>
                  <ListItemText primary="로그인" />
                </ListItem>
                <ListItem button component={Link} to="/signup" onClick={() => setOpen(false)}>
                  <ListItemText primary="회원가입" />
                </ListItem>
              </>
            ) : ( // ✅ 로그인 상태면 로그아웃 버튼만 표시
              <ListItem
                button
                onClick={() => {
                  logout(); // ✅ 로그아웃 처리
                  setOpen(false); // 메뉴 닫기
                }}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText primary="로그아웃" />
              </ListItem>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default NavBar;
