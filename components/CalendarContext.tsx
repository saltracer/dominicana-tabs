import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LiturgicalDay } from '../types';
import LiturgicalCalendarService from '../services/LiturgicalCalendar';

interface CalendarContextType {
  selectedDate: Date;
  liturgicalDay: LiturgicalDay | null;
  setSelectedDate: (date: Date) => void;
  updateCalendarSelection: (date: Date) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [selectedDate, setSelectedDateState] = useState(new Date());
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);

  const setSelectedDate = (date: Date) => {
    setSelectedDateState(date);
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  const updateCalendarSelection = (date: Date) => {
    setSelectedDateState(date);
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  // Initialize with today's date
  React.useEffect(() => {
    if (!liturgicalDay) {
      setSelectedDate(new Date());
    }
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        liturgicalDay,
        setSelectedDate,
        updateCalendarSelection,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
