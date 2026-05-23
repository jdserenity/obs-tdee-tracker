function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentDay(dayEndTime = "04:00") {
  const now = new Date();
  const [endHour, endMinute] = dayEndTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = endHour * 60 + endMinute;
  if (currentMinutes < endMinutes) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  }
  return formatDate(now);
}

module.exports = { formatDate, getCurrentDay };
