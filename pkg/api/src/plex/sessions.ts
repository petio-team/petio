import axios from "axios";
import MakePlexURL from './util';

export default async () => {
  const url = MakePlexURL(
    "/status/sessions",
  ).toString();

  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}