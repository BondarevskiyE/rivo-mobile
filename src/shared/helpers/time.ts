import {DateTime} from 'luxon';

export const getTimeString = (time: number) => {
  const date = DateTime.fromMillis(time);

  return date.toFormat('HH:mm');
};

export const getDateTimeString = (time: number) => {
  const date = DateTime.fromMillis(time);

  return date.toFormat('LLLL yy, HH:mm');
};
