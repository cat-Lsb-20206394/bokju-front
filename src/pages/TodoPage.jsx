import React, { useState } from 'react';
import TodoItem from '../components/TodoItem';

function TodoPage() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text, done: false },
    ]);
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) => 
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div>
      <h1>할 일</h1>
      {/* 할 일 추가하는 input, 버튼 */}
      {/* TodoItem을 .map()으로 여러 개 렌더링 */}
      {todos.map((item) => (
        <TodoItem
          key={item.id}
          todo={item}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
        />
      ))}
    </div>
  );
}

export default TodoPage;
