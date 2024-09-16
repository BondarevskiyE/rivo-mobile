import {DateTime} from 'luxon';

import {RemoteMessage} from '@/shared/types/notification';

type MsgDatesMap = {
  Today: RemoteMessage[];
  Yesterday: RemoteMessage[];
  [key: string]: RemoteMessage[];
};

function getDayEnding(dayNum: string | number) {
  switch (String(dayNum)) {
    case '1':
      return 'st';
    case '2':
      return 'nd';
    case '3':
      return 'rd';
    default:
      return 'th';
  }
}

export function createNotificationsMapByDate(
  messages: RemoteMessage[],
): MsgDatesMap {
  const currentDate = DateTime.now();

  return messages.reduce((acc, msg) => {
    const msgDate = DateTime.fromMillis(msg.sentTime || 0)
      .setLocale('en-us')
      .toUTC()
      .toLocal();

    // @ts-ignore
    const diffNow = Math.abs(msgDate.diffNow(['hours']).values.hours);
    // diff between current hour of the current day and transaction time in hours. It is negative only if transaction passed not today
    const diffHours = currentDate.hour - diffNow;
    // if diffHours is positive (it's today transaction)
    if (diffHours > 0) {
      return {...acc, Today: [...(acc?.Today || []), msg]};
    }
    // if diffHours is negative (it's not today transaction) and if diff less then 48 hours it's yesterday transaction
    if (diffHours < 0 && diffNow < 48) {
      return {...acc, Yesterday: [...(acc?.Yesterday || []), msg]};
    }

    const day = msgDate.day;
    const month = msgDate.monthLong;
    const year = msgDate.year;

    const monthEnding = getDayEnding(day);

    const strDate = `${month} ${day}${monthEnding} ${year}`;

    return {...acc, [strDate]: [...(acc[strDate] || []), msg]};
  }, {} as MsgDatesMap);
}
