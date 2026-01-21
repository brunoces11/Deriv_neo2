import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './store/ChatContext';
import { ThemeProvider } from './store/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { MainArea } from './components/layout/MainArea';
import { ExecutionsSidebar } from './components/layout/ExecutionsSidebar';
import { CardsPage } from './pages/CardsPage';

function MainLayout() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar 
        isCollapsed={leftSidebarCollapsed} 
        onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)} 
      />
      <MainArea />
      <ExecutionsSidebar 
        isCollapsed={rightSidebarCollapsed} 
        onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)} 
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/cards" element={<CardsPage />} />
          </Routes>
        </ChatProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
