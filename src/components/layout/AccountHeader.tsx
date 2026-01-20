import { useTheme } from '../../store/ThemeContext';

export function AccountHeader() {
  const { theme } = useTheme();

  return (
    <div className={`relative z-30 px-6 py-3 border-b backdrop-blur-sm transition-colors ${
      theme === 'dark'
        ? 'border-zinc-800/50 bg-zinc-900/50'
        : 'border-gray-200 bg-white/50'
    }`}>
      {/* Header vazio - user profile movido para o sidebar */}
    </div>
  );
}
