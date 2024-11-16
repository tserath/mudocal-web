import React from 'react';
import Calendar from 'react-calendar';
import { IoArrowBack } from 'react-icons/io5';
import { format } from 'date-fns';
import '../../styles/calendar.css';

const MobileCalendar = ({ selectedDate, onDateChange, onClose, availableEntries }) => {
  const handleDateChange = (date) => {
    onDateChange(date);
    onClose(); // Close the calendar view after date selection
  };

  const hasEntriesOnDate = (date) => {
    return Array.from(availableEntries.values()).some(entry => {
      const entryDate = new Date(entry.created);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-secondary dark:bg-secondary-dark border-b border-border dark:border-border-dark">
        <button
          onClick={onClose}
          className="flex items-center text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark"
        >
          <IoArrowBack className="w-6 h-6 mr-2" />
          Back
        </button>
        <div className="ml-4 text-lg font-semibold text-text dark:text-text-dark">
          {format(selectedDate, 'MMMM yyyy')}
        </div>
      </div>

      {/* Calendar */}
      <div className="mobile-calendar bg-primary dark:bg-primary-dark">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          formatDay={(locale, date) => format(date, 'd')}
          minDetail="month"
          maxDetail="month"
          navigationLabel={({ date }) => format(date, 'MMMM yyyy')}
          showNeighboringMonth={false}
          next2Label={null}
          prev2Label={null}
          locale="en-US"
          tileClassName={({ date }) => 
            hasEntriesOnDate(date) ? 'has-entries' : null
          }
          className="calendar-custom"
        />
      </div>
    </div>
  );
};

export default MobileCalendar;
