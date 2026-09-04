function pad(value) {
  return String(value).padStart(2, '0');
}

export function bi(zh, en) {
  return { zh, en };
}

export function genTimeline(status, startHour, startMinute = 0) {
  let time = startHour * 60 + startMinute;
  const format = (minutes) => pad(Math.floor(minutes / 60) % 24) + ':' + pad(minutes % 60);
  const timeline = { received: format(time) };
  if (status === 'pending') return timeline;
  time += 18;
  timeline.assigned = format(time);
  if (status === 'problem') {
    time += 35;
    timeline.started = format(time);
    return timeline;
  }
  time += 22;
  timeline.started = format(time);
  if (status === 'active') return timeline;
  time += 95;
  timeline.completed = format(time);
  time += 6;
  timeline.signed = format(time);
  return timeline;
}
