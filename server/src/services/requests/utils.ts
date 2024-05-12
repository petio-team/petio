export function calcDate(diff: number) {
  const day = 1000 * 60 * 60 * 24;

  let days = Math.ceil(diff / day);
  let months = Math.floor(days / 31);
  const years = Math.floor(months / 12);
  days -= months * 31;
  months -= years * 12;

  let message = '~';
  message += years ? `${years}y ` : '';
  message += months ? `${months}m ` : '';
  message += days ? `${days}d` : '';
  if (years) message = '> 1y';

  return message;
}

export function cinemaWindow(diff: number) {
  const day = 1000 * 60 * 60 * 24;
  const days = Math.ceil(diff / day);
  if (days >= 62) {
    return false;
  }
  return true;
}
