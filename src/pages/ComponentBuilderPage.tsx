import { useTheme } from '../store/ThemeContext';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatInput_NEO } from '../components/chat/ChatInput_NEO';

export function ComponentBuilderPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen p-8 ${
      theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Component Builder
        </h1>

        <div className="space-y-12">
          {/* Original ChatInput */}
          <section>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
            }`}>
              ChatInput (Original)
            </h2>
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}>
              <ChatInput />
            </div>
          </section>

          {/* NEO ChatInput */}
          <section>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
            }`}>
              ChatInput_NEO (Nova versão)
            </h2>
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}>
              <ChatInput_NEO />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
