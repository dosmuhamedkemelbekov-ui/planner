import React, { useState, useMemo } from 'react';
import { 
  Sun, Target, CheckCircle2, Flame, BarChart3, 
  Plus, LayoutGrid, Zap, Trophy, 
  Calendar, Coffee, BookOpen, Brain, Star, PenLine, MessageCircle
} from 'lucide-react';

// --- КОНСТАНТЫ И КОНФИГ ---

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

// --- ДАННЫЕ ПО УМОЛЧАНИЮ ---
// Горизонты и проекты
const INITIAL_HORIZONS = [
  { id: 'h1', title: 'Карьера и Рост', color: '#7c6ff7' },
  { id: 'h2', title: 'Здоровье и Тело', color: '#10b981' },
  { id: 'h3', title: 'Саморазвитие', color: '#f59e0b' },
];

const INITIAL_PROJECTS = [
  { id: 'p1', hId: 'h1', title: 'Запуск SaaS-продукта', progress: 65 },
  { id: 'p2', hId: 'h1', title: 'Изучение React Native', progress: 30 },
  { id: 'p3', hId: 'h2', title: 'Подготовка к марафону', progress: 45 },
  { id: 'p4', hId: 'h3', title: 'Чтение 24 книг в год', progress: 20 },
  { id: 'p5', hId: 'h3', title: 'Курс по дизайну', progress: 85 },
];

const INITIAL_TASKS = [
  { id: 1, pId: 'p1', text: 'Спроектировать базу данных', energy: '🔴', completed: false, focus: true },
  { id: 2, pId: 'p1', text: 'Настроить CI/CD пайплайны', energy: '🟡', completed: true, focus: false },
  { id: 3, pId: 'p2', text: 'Посмотреть модуль про навигацию', energy: '🟢', completed: false, focus: false },
  { id: 4, pId: 'p3', text: 'Пробежка 5 км (темп 6:00)', energy: '🔴', completed: false, focus: true },
  { id: 5, pId: 'p4', text: 'Прочитать 30 страниц "Атомных привычек"', energy: '🟢', completed: true, focus: false },
  { id: 6, pId: 'p5', text: 'Финальный проект по сеткам', energy: '🟡', completed: false, focus: true },
  { id: 7, pId: 'p1', text: 'Верстка главной страницы', energy: '🔴', completed: false, focus: false },
  { id: 8, pId: 'h1', text: 'Ответить на письма в LinkedIn', energy: '🟢', completed: true, focus: false },
];

// Заметки
const INITIAL_NOTES = [
  { id: 'n1', title: 'Главные цели на год', content: 'Запуск SaaS, марафон, дизайн-портфолио.', createdAt: 'Сегодня' },
  { id: 'n2', title: 'Идеи для продукта', content: 'AI-помощник для фрилансеров, трекер энергии.', createdAt: 'Вчера' },
];

// Планирование (структура для дня/недели)
const INITIAL_PLANS = {
  today: [
    { id: 't1', time: '08:00', label: 'Утренний ритуал', type: 'ritual' },
    { id: 't2', time: '10:00', label: 'Фокус-блок: продукт', type: 'deep' },
    { id: 't3', time: '18:30', label: 'Тренировка / бег', type: 'health' },
  ],
  week: [
    { id: 'w1', day: 'Пн', label: 'Работа над SaaS', type: 'deep' },
    { id: 'w2', day: 'Ср', label: 'Учёба / React Native', type: 'learning' },
    { id: 'w3', day: 'Сб', label: 'Длинный бег', type: 'health' },
  ]
};

// Для календаря (Google Calendar stub)
const INITIAL_CAL_EVENTS = [
  { id: 'c1', title: 'Deep work — продукт', time: '10:00–12:00', source: 'Личный календарь' },
  { id: 'c2', title: 'Тренировка', time: '19:00–20:00', source: 'Google Calendar' },
];

const INITIAL_HABITS = [
  { id: 1, title: 'Медитация 10 мин', streak: [1, 1, 1, 0, 1, 1, 1], doneToday: true },
  { id: 2, title: 'Кодинг 2 часа', streak: [1, 1, 0, 1, 1, 0, 1], doneToday: false },
  { id: 3, title: 'Зарядка', streak: [1, 1, 1, 1, 1, 1, 1], doneToday: true },
  { id: 4, title: 'Без сахара', streak: [0, 0, 1, 1, 0, 1, 1], doneToday: false },
];

const QUOTES = [
  "Твой единственный предел — это ты сам.",
  "Маленькие шаги ведут к большим результатам.",
  "Дисциплина — это выбор между тем, что ты хочешь сейчас, и тем, что ты хочешь больше всего.",
  "Сегодня — лучший день, чтобы начать."
];

export default function LifePlanner() {
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [plans] = useState(INITIAL_PLANS);
  const [calendarEvents, setCalendarEvents] = useState(INITIAL_CAL_EVENTS);
  const [newTaskText, setNewTaskText] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    { id: 'm1', from: 'ai', text: 'Привет! Я помогу тебе превратить цели в понятный план. Расскажи, над чем хочешь сфокусироваться.' }
  ]);
  const [morningRitual, setMorningRitual] = useState({ q1: '', q2: '', q3: '' });
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // Вычисления прогресса
  const stats = useMemo(() => {
    const done = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    return {
      percent: Math.round((done / total) * 100),
      done,
      total
    };
  }, [tasks]);

  // Хендлеры
  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText) return;
    const newTask = {
      id: Date.now(),
      pId: INITIAL_PROJECTS[0].id,
      text: newTaskText,
      energy: '🟡',
      completed: false,
      focus: false
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, doneToday: !h.doneToday } : h));
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.title && !newNote.content) return;
    const note = {
      id: Date.now().toString(),
      title: newNote.title || 'Без названия',
      content: newNote.content,
      createdAt: 'Только что',
    };
    setNotes([note, ...notes]);
    setNewNote({ title: '', content: '' });
  };

  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;

    const text = assistantInput.trim();

    const userMessage = {
      id: `u-${Date.now()}`,
      from: 'user',
      text,
    };
    setAssistantMessages((prev) => [...prev, userMessage]);
    setAssistantInput('');

    const projectId = import.meta.env.VITE_VERTEX_PROJECT_ID;
    const location = import.meta.env.VITE_VERTEX_LOCATION || 'us-central1';
    const accessToken = import.meta.env.VITE_VERTEX_ACCESS_TOKEN;
    const model = import.meta.env.VITE_VERTEX_MODEL || 'gemini-1.5-flash';

    if (!projectId || !accessToken) {
      const aiMessage = {
        id: `a-${Date.now()}`,
        from: 'ai',
        text: 'Vertex AI ещё не полностью настроен. Добавь VITE_VERTEX_PROJECT_ID и VITE_VERTEX_ACCESS_TOKEN в .env.local.',
      };
      setAssistantMessages((prev) => [...prev, aiMessage]);
      return;
    }

    try {
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-goog-user-project': projectId,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Ты выступаешь как персональный планировщик и коуч по эффективности. Пользователь пишет из своего личного планнера. Помоги разложить его запрос на конкретные шаги, задачи и блоки по времени.\n\nСообщение пользователя:\n${text}`,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        console.error('Vertex AI error', await res.text());
        throw new Error('Vertex AI request failed');
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const aiText =
        candidate?.content?.parts?.map((p) => p.text).join('\n') ||
        'Не удалось разобрать ответ от Vertex AI.';

      const aiMessage = {
        id: `a-${Date.now()}`,
        from: 'ai',
        text: aiText,
      };
      setAssistantMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const aiMessage = {
        id: `a-${Date.now()}`,
        from: 'ai',
        text: 'Я не смог подключиться к Vertex AI. Проверь токен доступа и настройки проекта в .env.local.',
      };
      setAssistantMessages((prev) => [...prev, aiMessage]);
    }
  };

  const connectGoogleCalendar = () => {
    if (!window.gapi) {
      alert('Google API скрипт ещё не загрузился. Обнови страницу и попробуй ещё раз.');
      return;
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      alert('Не найдены VITE_GOOGLE_CLIENT_ID и/или VITE_GOOGLE_API_KEY. Добавь их в .env.local.');
      return;
    }

    setIsCalendarSyncing(true);

    window.gapi.load('client:auth2', async () => {
      try {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: GOOGLE_DISCOVERY_DOCS,
          scope: GOOGLE_SCOPES,
        });

        const auth = window.gapi.auth2.getAuthInstance();
        if (!auth.isSignedIn.get()) {
          await auth.signIn();
        }

        const res = await window.gapi.client.calendar.events.list({
          calendarId: 'primary',
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const items = res.result.items || [];
        const mapped = items.map((event) => {
          const start = event.start?.dateTime || event.start?.date || '';
          const end = event.end?.dateTime || event.end?.date || '';
          const timeLabel = start && end ? `${start} → ${end}` : start || 'Без времени';

          return {
            id: event.id,
            title: event.summary || 'Без названия',
            time: timeLabel,
            source: 'Google Calendar',
          };
        });

        setCalendarEvents((prev) => {
          const withoutGoogle = prev.filter((e) => e.source !== 'Google Calendar');
          return [...withoutGoogle, ...mapped];
        });
      } catch (err) {
        console.error(err);
        alert('Не удалось загрузить события из Google Calendar. Проверь настройки в Google Cloud Console.');
      } finally {
        setIsCalendarSyncing(false);
      }
    });
  };

  // --- UI КОМПОНЕНТЫ ---

  const ProgressBar = ({ progress, color = '#7c6ff7' }) => (
    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2">
      <div 
        className="h-full transition-all duration-1000 ease-out"
        style={{ width: `${progress}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}44` }}
      />
    </div>
  );

  const NavItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
          isActive
            ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm'
            : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
        }`}
      >
        <Icon size={16} />
        <span>{label}</span>
      </button>
    );
  };

  // --- ЭКРАНЫ ---

  const RenderToday = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Привет, чем займёмся сегодня? 👋
        </h1>
        <p className="text-sm text-slate-500 italic">"{quote}"</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Ritual */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-pink-500">
            <Coffee size={20} />
            <h3 className="font-semibold">Утренний ритуал</h3>
          </div>
          <div className="space-y-3">
            <input 
              placeholder="За что я благодарен?" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/70"
              value={morningRitual.q1}
              onChange={(e) => setMorningRitual({...morningRitual, q1: e.target.value})}
            />
            <input 
              placeholder="Что сделает этот день отличным?" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/70"
              value={morningRitual.q2}
              onChange={(e) => setMorningRitual({...morningRitual, q2: e.target.value})}
            />
          </div>
        </div>

        {/* Focus of the day */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-orange-400">
            <Zap size={20} />
            <h3 className="font-semibold">Фокус дня</h3>
          </div>
          <div className="space-y-2">
            {tasks.filter(t => t.focus && !t.completed).slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs">{task.energy}</span>
                <span className="text-sm truncate text-slate-900">{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add & Tasks */}
      <div className="space-y-4">
        <form onSubmit={addTask} className="relative">
          <input 
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Добавить быструю задачу..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-pink-400/70 transition-all placeholder:text-slate-400"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500 hover:scale-110 transition-transform">
            <Plus size={24} />
          </button>
        </form>

        <div className="space-y-2">
          {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 hover:border-pink-400/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-pink-500 border-pink-500' : 'border-slate-300 group-hover:border-pink-400'}`}>
                  {task.completed && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-slate-900">{task.text}</span>
              </div>
              <span className="text-lg opacity-40 group-hover:opacity-100 transition-opacity">{task.energy}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RenderNotes = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
          <BookOpen className="text-pink-500" /> Заметки и идеи
        </h2>
        <span className="text-xs text-slate-500">
          Место, где рождаются стратегии, инсайты и разборы.
        </span>
      </div>

      <form onSubmit={addNote} className="space-y-3 bg-white border border-slate-200 rounded-2xl p-4">
        <input
          type="text"
          placeholder="Заголовок заметки"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/70"
          value={newNote.title}
          onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
        />
        <textarea
          placeholder="Свободные мысли, заметки, конспекты, идеи..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400/70"
          value={newNote.content}
          onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Пиши как есть. Потом вместе с ИИ превратим это в чёткий план.
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-500 hover:to-orange-500 px-4 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <PenLine className="w-3 h-3" />
            Сохранить заметку
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {note.title}
              </h3>
              <span className="text-[11px] text-slate-500">{note.createdAt}</span>
            </div>
            {note.content && (
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {note.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const RenderPlanning = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
        <Calendar className="text-orange-400" /> Дневной и недельный план
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sun className="w-4 h-4 text-orange-400" /> Сегодня
          </h3>
          <div className="space-y-2">
            {plans.today.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              >
                <span className="text-xs font-mono text-slate-400 w-14">
                  {item.time}
                </span>
                <span className="text-sm text-slate-900">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-pink-500" /> Неделя
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {plans.week.map(item => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 space-y-1"
              >
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  {item.day}
                </div>
                <div className="text-[13px] text-slate-900">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 max-w-2xl">
        Здесь удобно раскладывать крупные цели по слотам недели. Дальше можно будет синкать это с Google Calendar и
        генерировать план вместе с ИИ.
      </p>
    </div>
  );

  const RenderCalendar = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
          <Calendar className="text-pink-500" /> Календарь
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-pink-400/60 text-pink-500 px-4 py-1.5 text-xs font-medium hover:bg-pink-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={connectGoogleCalendar}
          disabled={isCalendarSyncing}
        >
          <Calendar className="w-3 h-3" />
          {isCalendarSyncing ? 'Синхронизация…' : 'Подключить Google Calendar'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Сводка ближайших блоков</span>
          <span>События из: локального плана и Google Calendar</span>
        </div>

        <div className="space-y-2">
          {calendarEvents.map(event => (
            <div
              key={event.id}
              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
            >
              <div className="space-y-1">
                <div className="text-slate-900">{event.title}</div>
                <div className="text-[11px] text-slate-500">{event.source}</div>
              </div>
              <div className="text-xs font-mono text-slate-500">
                {event.time}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500">
          Для реальной интеграции создай OAuth‑клиент в Google Cloud, подключи JS API и вместо заглушки наполни
          `calendarEvents` настоящими событиями.
        </p>
      </div>
    </div>
  );


  const RenderGoals = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
        <Target className="text-pink-500" /> Горизонты и проекты
      </h2>
      <div className="grid grid-cols-1 gap-8">
        {INITIAL_HORIZONS.map(horizon => (
          <div key={horizon.id} className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-xl font-semibold" style={{ color: horizon.color }}>{horizon.title}</h3>
              <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">Horizon level</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INITIAL_PROJECTS.filter(p => p.hId === horizon.id).map(project => (
                <div key={project.id} className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-pink-400/60 hover:-translate-y-1 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-pink-50 transition-colors">
                      <LayoutGrid size={18} className="text-pink-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">{project.progress}%</span>
                  </div>
                  <h4 className="font-semibold mb-3 text-slate-900">{project.title}</h4>
                  <ProgressBar progress={project.progress} color={horizon.color} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RenderHabits = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
        <Flame className="text-orange-400" /> Трекер привычек
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {habits.map(habit => (
          <div key={habit.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-[200px]">
              <button 
                onClick={() => toggleHabit(habit.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${habit.doneToday ? 'bg-green-500 shadow-[0_8px_24px_rgba(34,197,94,0.35)]' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                <CheckCircle2 className={habit.doneToday ? 'text-white' : 'text-slate-500'} />
              </button>
              <div>
                <h4 className="font-semibold text-slate-900">{habit.title}</h4>
                <p className="text-xs text-slate-500 uppercase tracking-tighter">7-day streak</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {habit.streak.map((day, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-500 ${day === 1 ? 'bg-pink-500 border-pink-500' : 'border-slate-200 bg-white'}`}
                  title={`Day ${i+1}`}
                />
              ))}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${habit.doneToday ? 'bg-green-500 border-green-500 animate-pulse' : 'border-dashed border-slate-300'}`}>
                {habit.doneToday && <Star size={12} className="text-white fill-current" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RenderOverview = () => (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
        <BarChart3 className="text-pink-500" /> Статистика недели
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * stats.percent) / 100}
                className="text-[#7c6ff7] transition-all duration-1000 ease-in-out"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-bold tracking-tighter">{stats.percent}%</span>
          </div>
          <p className="text-slate-500 text-sm uppercase font-semibold tracking-widest">Готовность дня</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-pink-100 to-orange-50 p-6 rounded-3xl border border-pink-200">
            <h4 className="text-4xl font-black text-pink-500">{stats.done}</h4>
            <p className="text-sm text-slate-500 mt-2">Задач завершено</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h4 className="text-4xl font-black text-slate-900">{stats.total - stats.done}</h4>
            <p className="text-sm text-slate-500 mt-2">В очереди</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h4 className="text-4xl font-black text-green-500">12</h4>
            <p className="text-sm text-slate-500 mt-2">Дней страйк</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h4 className="text-4xl font-black text-orange-400">4.8</h4>
            <p className="text-sm text-slate-500 mt-2">Средняя энергия</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-slate-900"><Brain size={18} className="text-pink-500" /> Вечерняя рефлексия</h4>
        <textarea 
          placeholder="Главное достижение сегодня? Что можно улучшить завтра?" 
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-pink-400/70 resize-none placeholder:text-slate-400"
        ></textarea>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-pink-300/30 pb-8">
      {/* Content Area */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-8 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white/80 backdrop-blur border border-slate-200 rounded-3xl px-4 py-3 md:px-6 md:py-4 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-300 flex items-center justify-center text-white text-sm font-semibold">
                LP
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight">my.life.planner</span>
                <span className="text-[11px] text-slate-500">Твой личный productivity‑инстаграм</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] md:text-xs text-slate-500">
            <Sun className="w-4 h-4 text-orange-400" />
            <span>Сегодня — лучший день чуть продвинуться вперёд.</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-full px-2 py-1 w-max shadow-sm">
          <NavItem id="today" icon={Sun} label="Сегодня" />
          <NavItem id="goals" icon={Target} label="Цели" />
          <NavItem id="notes" icon={BookOpen} label="Заметки" />
          <NavItem id="planning" icon={LayoutGrid} label="Планирование" />
          <NavItem id="calendar" icon={Calendar} label="Календарь" />
          <NavItem id="habits" icon={Flame} label="Привычки" />
          <NavItem id="overview" icon={BarChart3} label="Обзор" />
          <NavItem id="assistant" icon={MessageCircle} label="ИИ‑ассистент" />
        </div>

        <div>
          {activeTab === 'today' && <RenderToday />}
          {activeTab === 'goals' && <RenderGoals />}
          {activeTab === 'notes' && <RenderNotes />}
          {activeTab === 'planning' && <RenderPlanning />}
          {activeTab === 'calendar' && <RenderCalendar />}
          {activeTab === 'habits' && <RenderHabits />}
          {activeTab === 'overview' && <RenderOverview />}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center gap-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-50">
                  <CheckCircle2 className="text-indigo-400" /> Все задачи
                </h2>
                <div className="flex gap-2">
                  {['🔴', '🟡', '🟢'].map(e => (
                    <span 
                      key={e} 
                      className="p-2 bg-slate-900/80 border border-slate-800 rounded-xl cursor-pointer text-lg leading-none"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border bg-slate-900/80 ${
                      task.completed 
                        ? 'border-transparent opacity-60' 
                        : 'border-slate-800 hover:border-indigo-500/40'
                    } transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleTask(task.id)} 
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                          task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                        }`}
                      >
                        {task.completed && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                      <span className={task.completed ? 'line-through text-slate-500' : 'text-slate-100'}>
                        {task.text}
                      </span>
                    </div>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 bg-slate-950/70 px-2 py-1 rounded">
                        #{task.pId}
                      </span>
                      {task.energy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'assistant' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
                <MessageCircle className="text-pink-500" /> ИИ‑ассистент
              </h2>
              <p className="text-sm text-slate-500 max-w-2xl">
                Опиши свои цели, ограничения по времени и энергию — ассистент поможет разложить это по задачам, дням и
                подскажет, с чего начать. Сейчас работает в режиме прототипа с заглушкой, но уже готов к интеграции с реальным API.
              </p>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 h-[420px] shadow-sm">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {assistantMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        msg.from === 'ai'
                          ? 'bg-slate-100 text-slate-900 border border-slate-200'
                          : 'bg-gradient-to-r from-pink-500 to-orange-400 text-white ml-auto'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAssistantSubmit} className="flex items-end gap-2">
                  <textarea
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-pink-400/70"
                    placeholder="Напиши сюда: «У меня 2 часа вечером и цель — продвинуть SaaS. Что лучше сделать?»"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-500 hover:to-orange-500 text-white px-3 py-2 text-sm font-medium shadow-sm"
                  >
                    <SendIcon />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; background-color: #fafafa; color: #0f172a; }
        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12L4.29289 11.2929C3.90237 11.6834 3.90237 12.3166 4.29289 12.7071L5 12ZM19 12L19.7071 12.7071C20.0976 12.3166 20.0976 11.6834 19.7071 11.2929L19 12ZM11 6L11.7071 5.29289C11.3166 4.90237 10.6834 4.90237 10.2929 5.29289L11 6ZM10.2929 18.7071C10.6834 19.0976 11.3166 19.0976 11.7071 18.7071L11 18L10.2929 18.7071ZM4.29289 12.7071L10.2929 18.7071L11.7071 17.2929L5.70711 11.2929L4.29289 12.7071ZM5.70711 12.7071L11.7071 6.70711L10.2929 5.29289L4.29289 11.2929L5.70711 12.7071ZM5 13H19V11H5V13ZM18.2929 11.2929L15.2929 8.29289L13.8787 9.70711L16.8787 12.7071L18.2929 11.2929ZM16.8787 11.2929L13.8787 14.2929L15.2929 15.7071L18.2929 12.7071L16.8787 11.2929Z"
        fill="currentColor"
      />
    </svg>
  );
}