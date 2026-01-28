import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './store/ChatContext';
import { ThemeProvider, useTheme } from './store/ThemeContext';
import { ViewModeProvider, useViewMode } from './store/ViewModeContext';
import { DrawingToolsProvider } from './store/DrawingToolsContext';
import { SessionSyncProvider } from './components/SessionSyncProvider';
import { Sidebar } from './components/layout/Sidebar';
import { MainArea } from './components/layout/MainArea';
import { CardsSidebar } from './components/layout/CardsSidebar';
import { ChartLayer } from './components/chart/ChartLayer';
import { CardsPage } from './pages/CardsPage';
import { ComponentBuilderPage } from './pages/ComponentBuilderPage';
import { CashierPage } from './pages/CashierPage';

function MainLayout() {
  const { theme } = useTheme();
  const {
    currentMode,
    sidebarCollapsed,
    cardsSidebarCollapsed,
    cardsSidebarWidth,
    chartVisible,
    updateUserPoint,
    setResizing,
  } = useViewMode();

  return (
    <div className="h-screen flex overflow-hidden relative">
      <ChartLayer isVisible={chartVisible} theme={theme} />
      
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => updateUserPoint({ sidebarCollapsed: !sidebarCollapsed })} 
      />
      
      <MainArea isGraphMode={currentMode === 'graph'} />
      
      <CardsSidebar 
        isCollapsed={cardsSidebarCollapsed}
        width={cardsSidebarWidth}
        isGraphMode={currentMode === 'graph'}
        onToggleCollapse={() => updateUserPoint({ cardsSidebarCollapsed: !cardsSidebarCollapsed })}
        onResize={(width) => updateUserPoint({ cardsSidebarWidth: width })}
        onResizeStart={() => setResizing(true)}
        onResizeEnd={() => setResizing(false)}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ViewModeProvider>
          <DrawingToolsProvider>
            <ChatProvider>
              <SessionSyncProvider>
                <Routes>
                  <Route path="/" element={<MainLayout />} />
                  <Route path="/cards" element={<CardsPage />} />
                  <Route path="/component-builder" element={<ComponentBuilderPage />} />
                  <Route path="/cashier" element={<CashierPage />} />
                </Routes>
              </SessionSyncProvider>
            </ChatProvider>
          </DrawingToolsProvider>
        </ViewModeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
