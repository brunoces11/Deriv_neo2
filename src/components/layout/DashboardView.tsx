import { useTheme } from '../../store/ThemeContext';

export function DashboardView() {
  const { theme } = useTheme();

  return (
    <div className={`w-full h-full flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Dashboard Mode</h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Your trading dashboard will appear here
        </p>
      </div>
    </div>
  );
}
