import axios from "axios";
import MakePlexURL from "./util";

export default async () => {
  const url = MakePlexURL(
    "/statistics/resources",
    {
      timespan: 6,
    }
  ).toString();

  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}