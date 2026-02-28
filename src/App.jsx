import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sun, Moon, Target, CheckCircle2, Flame, BarChart3, 
  Plus, LayoutGrid, Zap, ChevronRight, Trophy, 
  Calendar, Coffee, BookOpen, Brain, Star
} from 'lucide-react';

// --- ДАННЫЕ ПО УМОЛЧАНИЮ ---
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
  const [newTaskText, setNewTaskText] = useState('');
  const [morningRitual, setMorningRitual] = useState({ q1: '', q2: '', q3: '' });

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

  // --- UI КОМПОНЕНТЫ ---

  const ProgressBar = ({ progress, color = '#7c6ff7' }) => (
    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2">
      <div 
        className="h-full transition-all duration-1000 ease-out"
        style={{ width: `${progress}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}44` }}
      />
    </div>
  );

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1 transition-all ${activeTab === id ? 'text-[#7c6ff7] scale-110' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <Icon size={20} />
      <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
    </button>
  );

  // --- ЭКРАНЫ ---

  const RenderToday = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Привет, Чемпион! 👋</h1>
        <p className="text-gray-400 italic font-light italic">"{quote}"</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Ritual */}
        <div className="bg-[#1a1a24] p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-[#7c6ff7]">
            <Coffee size={20} />
            <h3 className="font-bold">Утренний Ритуал</h3>
          </div>
          <div className="space-y-3">
            <input 
              placeholder="За что я благодарен?" 
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c6ff7]/50"
              value={morningRitual.q1}
              onChange={(e) => setMorningRitual({...morningRitual, q1: e.target.value})}
            />
            <input 
              placeholder="Что сделает этот день отличным?" 
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c6ff7]/50"
              value={morningRitual.q2}
              onChange={(e) => setMorningRitual({...morningRitual, q2: e.target.value})}
            />
          </div>
        </div>

        {/* Focus of the day */}
        <div className="bg-[#1a1a24] p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-orange-400">
            <Zap size={20} />
            <h3 className="font-bold">Фокус дня</h3>
          </div>
          <div className="space-y-2">
            {tasks.filter(t => t.focus && !t.completed).slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border-l-2 border-orange-400">
                <span className="text-xs">{task.energy}</span>
                <span className="text-sm truncate">{task.text}</span>
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
            className="w-full bg-[#1a1a24] border border-white/10 rounded-2xl py-4 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-[#7c6ff7]/50 transition-all"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c6ff7] hover:scale-110 transition-transform">
            <Plus size={24} />
          </button>
        </form>

        <div className="space-y-2">
          {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className="group flex items-center justify-between bg-[#1a1a24] p-4 rounded-2xl border border-white/5 hover:border-[#7c6ff7]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#7c6ff7] border-[#7c6ff7]' : 'border-gray-600'}`}>
                  {task.completed && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-gray-200">{task.text}</span>
              </div>
              <span className="text-lg opacity-40 group-hover:opacity-100 transition-opacity">{task.energy}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RenderGoals = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Target className="text-[#7c6ff7]" /> Горизонты и Проекты
      </h2>
      <div className="grid grid-cols-1 gap-8">
        {INITIAL_HORIZONS.map(horizon => (
          <div key={horizon.id} className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-xl font-semibold" style={{ color: horizon.color }}>{horizon.title}</h3>
              <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Horizon Level</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INITIAL_PROJECTS.filter(p => p.hId === horizon.id).map(project => (
                <div key={project.id} className="bg-[#1a1a24] p-5 rounded-3xl border border-white/5 hover:translate-y-[-4px] transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#7c6ff7]/10 transition-colors">
                      <LayoutGrid size={18} className="text-[#7c6ff7]" />
                    </div>
                    <span className="text-sm font-bold text-gray-400">{project.progress}%</span>
                  </div>
                  <h4 className="font-bold mb-3">{project.title}</h4>
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
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Flame className="text-orange-500" /> Трекер привычек
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {habits.map(habit => (
          <div key={habit.id} className="bg-[#1a1a24] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-[200px]">
              <button 
                onClick={() => toggleHabit(habit.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${habit.doneToday ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <CheckCircle2 className={habit.doneToday ? 'text-white' : 'text-gray-600'} />
              </button>
              <div>
                <h4 className="font-bold">{habit.title}</h4>
                <p className="text-xs text-gray-500 uppercase tracking-tighter">7-day streak</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {habit.streak.map((day, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-500 ${day === 1 ? 'bg-[#7c6ff7] border-[#7c6ff7]' : 'border-white/5 bg-transparent'}`}
                  title={`Day ${i+1}`}
                />
              ))}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${habit.doneToday ? 'bg-green-500 border-green-500 animate-pulse' : 'border-dashed border-gray-600'}`}>
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
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="text-blue-400" /> Статистика недели
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a24] p-8 rounded-[40px] border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
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
          <p className="text-gray-400 text-sm uppercase font-bold tracking-widest">Готовность дня</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#7c6ff7]/20 to-transparent p-6 rounded-3xl border border-[#7c6ff7]/20">
            <h4 className="text-4xl font-black text-[#7c6ff7]">{stats.done}</h4>
            <p className="text-sm text-gray-400 mt-2">Задач завершено</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h4 className="text-4xl font-black text-white">{stats.total - stats.done}</h4>
            <p className="text-sm text-gray-400 mt-2">В очереди</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h4 className="text-4xl font-black text-green-500">12</h4>
            <p className="text-sm text-gray-400 mt-2">Дней страйк</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h4 className="text-4xl font-black text-orange-400">4.8</h4>
            <p className="text-sm text-gray-400 mt-2">Средняя энергия</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a24] p-6 rounded-3xl border border-white/5">
        <h4 className="font-bold mb-4 flex items-center gap-2"><Brain size={18} className="text-purple-400" /> Вечерняя рефлексия</h4>
        <textarea 
          placeholder="Главное достижение сегодня? Что можно улучшить завтра?" 
          className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm h-32 focus:outline-none focus:border-[#7c6ff7]/50 resize-none"
        ></textarea>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white font-sans selection:bg-[#7c6ff7]/30 pb-24 md:pb-8 md:pl-20">
      
      {/* Sidebar Navigation (Desktop) */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-[#1a1a24] border-r border-white/5 hidden md:flex flex-col items-center py-10 gap-10 z-50">
        <div className="w-12 h-12 bg-[#7c6ff7] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(124,111,247,0.4)] mb-6">
          <Trophy className="text-white" />
        </div>
        <NavItem id="today" icon={Sun} label="День" />
        <NavItem id="goals" icon={Target} label="Цели" />
        <NavItem id="tasks" icon={CheckCircle2} label="Дела" />
        <NavItem id="habits" icon={Flame} label="Трекер" />
        <div className="mt-auto">
          <NavItem id="overview" icon={BarChart3} label="Итог" />
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-4xl mx-auto px-6 pt-10">
        {activeTab === 'today' && <RenderToday />}
        {activeTab === 'goals' && <RenderGoals />}
        {activeTab === 'habits' && <RenderHabits />}
        {activeTab === 'overview' && <RenderOverview />}
        {activeTab === 'tasks' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold flex items-center gap-2"><CheckCircle2 className="text-[#7c6ff7]" /> Все задачи</h2>
               <div className="flex gap-2">
                 {['🔴', '🟡', '🟢'].map(e => <span key={e} className="p-2 bg-[#1a1a24] rounded-lg cursor-pointer hover:bg-white/10">{e}</span>)}
               </div>
             </div>
             <div className="space-y-3">
               {tasks.map(task => (
                 <div key={task.id} className={`flex items-center justify-between p-4 bg-[#1a1a24] rounded-2xl border ${task.completed ? 'border-transparent opacity-50' : 'border-white/5 hover:border-[#7c6ff7]/30'} transition-all`}>
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-md border-2 ${task.completed ? 'bg-[#7c6ff7] border-[#7c6ff7]' : 'border-gray-500'}`}>
                        {task.completed && <CheckCircle2 size={14} />}
                      </button>
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.text}</span>
                    </div>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-600 bg-black/30 px-2 py-1 rounded">#{task.pId}</span>
                      {task.energy}
                    </span>
                 </div>
               ))}
             </div>
           </div>
        )}
      </main>

      {/* Mobile Navigation (Bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a24]/80 backdrop-blur-xl border-t border-white/5 flex md:hidden justify-around py-4 px-2 z-50">
        <NavItem id="today" icon={Sun} label="Сегодня" />
        <NavItem id="goals" icon={Target} label="Цели" />
        <NavItem id="habits" icon={Flame} label="Привычки" />
        <NavItem id="overview" icon={BarChart3} label="Обзор" />
      </nav>

      {/* Global Progress Floating Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[60] md:pl-20">
        <div 
          className="h-full bg-gradient-to-r from-[#7c6ff7] to-[#10b981] transition-all duration-700"
          style={{ width: `${stats.percent}%` }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}