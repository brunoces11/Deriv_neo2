import { ChatProvider } from './store/ChatContext';
import { ThemeProvider } from './store/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { MainArea } from './components/layout/MainArea';

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="h-screen flex overflow-hidden">
          <Sidebar />
          <MainArea />
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
