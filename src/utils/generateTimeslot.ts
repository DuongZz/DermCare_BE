export const generateTimeSlots = (startStr: string, endStr: string, durationMinutes: number) => {
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const totalSlots = Math.floor((endTotal - startTotal) / durationMinutes);

  if (totalSlots <= 0) return [];

  return Array.from({ length: totalSlots }).map((_, i) => {
    const slotStartMin = startTotal + i * durationMinutes;
    const slotEndMin = slotStartMin + durationMinutes;

    const formatTime = (min: number) =>
      `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

    return { start: formatTime(slotStartMin), end: formatTime(slotEndMin) };
  });
};
