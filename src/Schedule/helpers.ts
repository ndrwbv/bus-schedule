/**
 * находит ближайшее время в расписании
 * @param hours
 */
export const findClosesTime = (hours: string[]): Date | null => {
  let closestTime: Date | null = null;

  for (let i = 0; i < hours.length; i++) {
    const splitted = hours[i].split(":").map((item) => parseInt(item, 10));

    const possibleDate = new Date().setHours(splitted[0], splitted[1]);

    if (possibleDate - new Date().getTime() > 0) {
      if (!closestTime) closestTime = new Date(possibleDate);
      else if (closestTime.getTime() - possibleDate > 0)
        closestTime = new Date(possibleDate);
    }
  }

  return closestTime;
};

/**
 * Возвращает массив таймингов которые будут в будущем
 * @param hours
 */
 export const findClosesTimeArray = (hours: string[]): string[] => {
  let closestTime: string[] = [];
  
  for (let i = 0; i < hours.length; i++) {
    const splitted = hours[i].split(":").map((item) => parseInt(item, 10));

    const possibleDate = new Date().setHours(splitted[0], splitted[1]);

    if (possibleDate - new Date().getTime() > 0) {
      closestTime.push(hours[i])
    }
  }

  return closestTime;
};

export interface ITime {
  hours: number | null;
  minutes: number | null;
}
const getTimeFromMins = (mins: number): ITime => {
  let hours = Math.trunc(mins / 60);
  let minutes = Math.round(mins % 60);

  return {
    hours,
    minutes,
  };
};

/**
 * Находит разницу текущего времени с расписанием = столько надо ждать
 * @param closestTime
 * @currentDate
 */
export const calculateHowMuchIsLeft = (
  closestTime: Date | null
): ITime => {
  if (!closestTime)
    return {
      hours: null,
      minutes: null,
    };

  const left =
    Math.abs(closestTime.getTime() - new Date().getTime()) / 1000 / 60;

  return getTimeFromMins(left);
};
