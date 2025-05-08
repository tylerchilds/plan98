import elf from '@silly/elf'

const today = new Date();
const yesterday = new Date(today - 1);
const tomorrow = new Date(today + 1);
const thisWeek = new Date(today + 7);
const lastWeek = new Date(today - 7)

// dear diary
const $ = elf('dear-diary')

// you are my diary
$.draw(()=> {
  return `
    This Week

    Tomorrow

    Today

    Yesterday

    Last Week
  `
})
// Function to get all days in a given month
function getDaysInMonth(year, month) {
  const days = [];

  // Create a date for the first day of the month
  const firstDayOfMonth = new Date(year, month, 1);

  // Get the last day of the month by going to the first day of the next month
  // and subtracting one day
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Loop through all days in the month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    days.push({
      date: currentDate,
      dayOfWeek: currentDate.getDay(), // 0 is Sunday, 6 is Saturday
      dayOfMonth: day,
      isToday: today.getDate() === day &&
               today.getMonth() === month &&
               today.getFullYear() === year
    });
  }

  return days;
}

// Get current month and year
const currentMonth = today.getMonth(); // 0-based (0 is January, 11 is December)
const currentYear = today.getFullYear();

// Get all days in the current month
const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);

// Display the current month's information
console.log(`Calendar for ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(today)}`);

// Format and display each day
daysInCurrentMonth.forEach(day => {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(day.date);
  const dateStr = day.date.toLocaleDateString();
  const todayMarker = day.isToday ? ' (TODAY)' : '';

  console.log(`${weekday}, ${dateStr}${todayMarker}`);
});

// You can also display as a traditional calendar grid
console.log("\nCalendar Grid:");
console.log("Sun  Mon  Tue  Wed  Thu  Fri  Sat");

// Determine the starting position (day of week of the 1st)
const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

// Print leading spaces
let gridLine = "";
for (let i = 0; i < firstDayOfWeek; i++) {
  gridLine += "     ";
}

// Print days
for (let i = 0; i < daysInCurrentMonth.length; i++) {
  const day = daysInCurrentMonth[i].dayOfMonth;
  // Add day with proper padding
  gridLine += day.toString().padStart(2, ' ') + (daysInCurrentMonth[i].isToday ? '*' : ' ') + '  ';

  // If it's Saturday or the last day, start a new line
  if (daysInCurrentMonth[i].dayOfWeek === 6 || i === daysInCurrentMonth.length - 1) {
    console.log(gridLine);
    gridLine = "";
  }
}
