import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './store/ChatContext';
import { ThemeProvider, useTheme } from './store/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { MainArea } from './components/layout/MainArea';
import { ExecutionsSidebar } from './components/layout/ExecutionsSidebar';
import { ChartLayer } from './components/chart/ChartLayer';
import { CardsPage } from './pages/CardsPage';

function MainLayout() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const { theme } = useTheme();

  const handleChartToggle = () => {
    const newChartState = !isChartVisible;
    setIsChartVisible(newChartState);
    
    if (newChartState) {
      // Auto-collapse both sidebars when chart is shown
      setLeftSidebarCollapsed(true);
      setRightSidebarCollapsed(true);
    } else {
      // Auto-expand both sidebars when chart is hidden (only if collapsed)
      setLeftSidebarCollapsed(false);
      setRightSidebarCollapsed(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Chart Layer - Full screen background, behind everything */}
      <ChartLayer isVisible={isChartVisible} theme={theme} />
      
      <Sidebar 
        isCollapsed={leftSidebarCollapsed} 
        onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)} 
      />
      <MainArea 
        isChartVisible={isChartVisible}
        onChartToggle={handleChartToggle}
      />
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
