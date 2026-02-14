import { CATEGORIES } from './storage';

export function computeAnalytics(entries) {
  const totalSlots = entries.filter(e => e.activity).length;
  const totalMinutes = totalSlots * 15;

  // Time per category
  const categoryMap = {};
  CATEGORIES.forEach(c => { categoryMap[c.id] = 0; });
  entries.forEach(e => {
    if (e.activity && e.category) {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 15;
    }
  });

  const categoryBreakdown = CATEGORIES
    .map(c => ({
      ...c,
      minutes: categoryMap[c.id] || 0,
      hours: ((categoryMap[c.id] || 0) / 60).toFixed(1),
      percentage: totalMinutes > 0 ? Math.round(((categoryMap[c.id] || 0) / totalMinutes) * 100) : 0,
    }))
    .filter(c => c.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  // Productive categories (everything except leisure, other, and break)
  const productiveIds = ['deep-work', 'meeting', 'email', 'admin', 'learning', 'creative', 'exercise'];
  const productiveMinutes = productiveIds.reduce((sum, id) => sum + (categoryMap[id] || 0), 0);
  const productivityScore = totalMinutes > 0 ? Math.round((productiveMinutes / totalMinutes) * 100) : 0;

  // Longest streak of productive work
  let maxStreak = 0;
  let currentStreak = 0;
  entries.forEach(e => {
    if (e.activity && productiveIds.includes(e.category)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  // Peak hours (which hours had most logged entries)
  const hourCounts = {};
  entries.forEach(e => {
    if (e.activity) {
      const hour = parseInt(e.slotId.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const peakHourLabel = peakHour
    ? `${parseInt(peakHour[0]) % 12 || 12}:00 ${parseInt(peakHour[0]) < 12 ? 'AM' : 'PM'}`
    : 'N/A';

  // Hourly activity for chart
  const hourlyData = [];
  for (let h = 6; h <= 23; h++) {
    const hourEntries = entries.filter(e => {
      if (!e.activity) return false;
      const eHour = parseInt(e.slotId.split(':')[0]);
      return eHour === h;
    });
    const label = `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
    hourlyData.push({
      hour: label,
      productive: hourEntries.filter(e => productiveIds.includes(e.category)).length * 15,
      other: hourEntries.filter(e => !productiveIds.includes(e.category)).length * 15,
    });
  }

  // Insights
  const insights = [];
  if (productivityScore >= 70) {
    insights.push({ type: 'positive', text: 'Incredible focus today! You spent over 70% of your time on productive tasks.' });
  } else if (productivityScore >= 50) {
    insights.push({ type: 'positive', text: 'Solid day! Over half your time went to productive work.' });
  } else if (totalMinutes > 0) {
    insights.push({ type: 'neutral', text: 'Consider blocking off more time for deep work tomorrow.' });
  }

  if (maxStreak >= 4) {
    insights.push({ type: 'positive', text: `Great focus streak! You had ${maxStreak * 15} minutes of uninterrupted productive time.` });
  }

  const meetingMinutes = categoryMap['meeting'] || 0;
  if (meetingMinutes > 120) {
    insights.push({ type: 'warning', text: `You spent ${(meetingMinutes / 60).toFixed(1)} hours in meetings. Consider protecting more focus time.` });
  }

  if (categoryMap['break'] === 0 && totalMinutes > 120) {
    insights.push({ type: 'warning', text: 'No breaks logged! Remember to take breaks for sustained productivity.' });
  }

  if (categoryMap['exercise'] > 0) {
    insights.push({ type: 'positive', text: 'Nice work fitting in exercise today!' });
  }

  return {
    totalSlots,
    totalMinutes,
    totalHours: (totalMinutes / 60).toFixed(1),
    categoryBreakdown,
    productivityScore,
    maxStreak: maxStreak * 15,
    peakHourLabel,
    hourlyData,
    insights,
    productiveMinutes,
  };
}
