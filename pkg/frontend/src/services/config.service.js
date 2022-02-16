import { get, post } from "../helpers";
import store from "../redux/store.js";

export function checkConfig() {
  return get("/config");
}

export async function saveConfig(config) {
  try {
    await post(`/setup/set`, config);
  } catch (e) {
    console.log(e);
    throw "Error saving your config";
  }
}

export async function testMongo(mongo) {
  try {
    let result = await post(`/setup/test_mongo`, { mongo });
    return result.status;
  } catch (err) {
    console.log(err);
    return "failed";
  }
}

export async function updateConfig(config) {
  return post(`/config/update`, config);
}

export async function getConfig() {
  const data = await get(`/config/current`);
  if (!data) throw "No data";
  updateStore({
    type: "user/get-config",
    config: data,
  });
  return data;
}

function updateStore(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}
