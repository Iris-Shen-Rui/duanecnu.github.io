'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingCalendarProps {
  meetings: Array<{ id: string; date: string }>;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

export function MeetingCalendar({ meetings, onSelectDate, selectedDate }: MeetingCalendarProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // 获取某个月份的会议日期集合
  const getMeetingDatesInMonth = (year: number, month: number) => {
    const dates = new Set<string>();
    meetings.forEach(meeting => {
      const meetingDate = new Date(meeting.date);
      if (meetingDate.getFullYear() === year && meetingDate.getMonth() === month) {
        dates.add(meetingDate.getDate().toString());
      }
    });
    return dates;
  };

  // 获取月份天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 获取月份第一天是星期几
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // 上一个月
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 下一个月
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 判断某天是否有会议
  const hasMeeting = (day: number) => {
    const meetingDates = getMeetingDatesInMonth(currentYear, currentMonth);
    return meetingDates.has(day.toString());
  };

  // 判断某天是否被选中
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === currentYear &&
           selectedDate.getMonth() === currentMonth &&
           selectedDate.getDate() === day;
  };

  // 处理日期点击
  const handleDayClick = (day: number) => {
    if (hasMeeting(day)) {
      const date = new Date(currentYear, currentMonth, day);
      onSelectDate(date);
    }
  };

  const meetingDates = getMeetingDatesInMonth(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium text-lg">
          {currentYear}年 {monthNames[currentMonth]}
        </h3>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-gray-500 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {/* 空白格 */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="py-2" />
        ))}

        {/* 日期 */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const hasMeetingThisDay = hasMeeting(day);
          const isDaySelected = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!hasMeetingThisDay}
              className={cn(
                'py-2 rounded-lg transition-colors',
                hasMeetingThisDay
                  ? 'hover:bg-blue-50 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed',
                isDaySelected && 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <div className={cn(
                'relative inline-flex items-center justify-center w-8 h-8',
                hasMeetingThisDay && 'font-medium'
              )}>
                {day}
                {hasMeetingThisDay && !isDaySelected && (
                  <div className="absolute -bottom-0.5 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>有组会</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <span>无组会</span>
          </div>
        </div>
      </div>
    </div>
  );
}
