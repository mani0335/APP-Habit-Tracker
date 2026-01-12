import { useState, useEffect } from 'react';
import { Habit, Note } from '@/types/habit';
import { useAuth } from '@/context/AuthContext';

const HABITS_KEY_BASE = 'habit-tracker-habits';
const NOTES_KEY_BASE = 'habit-tracker-notes';

const defaultHabits: Habit[] = [
  { id: '1', name: 'Morning Workout', emoji: '💪', goal: 30, completions: {} },
  { id: '2', name: 'Read 20 Pages', emoji: '📖', goal: 30, completions: {} },
  { id: '3', name: 'Meditate', emoji: '🧘', goal: 30, completions: {} },
  { id: '4', name: 'Drink 8 Glasses', emoji: '💧', goal: 30, completions: {} },
  { id: '5', name: 'Learn Language', emoji: '🗣️', goal: 30, completions: {} },
];

export function useHabits() {
  const { currentUser } = useAuth();

  const userId = currentUser?.id ?? 'guest';

  const HABITS_KEY = `${HABITS_KEY_BASE}:${userId}`;
  const NOTES_KEY = `${NOTES_KEY_BASE}:${userId}`;

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(HABITS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
    // for guests keep defaults; for logged-in users start empty
    return userId === 'guest' ? defaultHabits : [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
    return [];
  });

  // When the logged-in user changes, reload their data from localStorage
  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem(HABITS_KEY);
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      else setHabits(userId === 'guest' ? defaultHabits : []);

      const savedNotes = localStorage.getItem(NOTES_KEY);
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      else setNotes([]);
    } catch {
      // ignore
      setHabits(userId === 'guest' ? defaultHabits : []);
      setNotes([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch {}
  }, [habits, HABITS_KEY]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes, NOTES_KEY]);

  const addHabit = (name: string, emoji: string, goal: number = 30) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      emoji,
      goal,
      completions: {},
    };
    setHabits([...habits, newHabit]);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions };
        newCompletions[date] = !newCompletions[date];
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  const addNote = (text: string, date?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
      date: date ? date.slice(0, 10) : undefined,
    };
    setNotes([newNote, ...notes]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const getHabitStats = (habit: Habit, month: number, year: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let completed = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (habit.completions[dateStr]) {
        completed++;
      }
    }
    
    return {
      completed,
      left: habit.goal - completed,
      percentage: Math.round((completed / habit.goal) * 100),
    };
  };

  const getMonthlyStats = (month: number, year: number) => {
    let totalCompleted = 0;
    let totalGoal = 0;
    
    habits.forEach(habit => {
      const stats = getHabitStats(habit, month, year);
      totalCompleted += stats.completed;
      totalGoal += habit.goal;
    });
    
    return {
      completed: totalCompleted,
      total: totalGoal,
      percentage: totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0,
    };
  };

  return {
    habits,
    notes,
    addHabit,
    deleteHabit,
    toggleCompletion,
    addNote,
    deleteNote,
    getHabitStats,
    getMonthlyStats,
  };
}

