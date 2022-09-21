import path from "path";
import pathConfig from "./paths";

type ViewsConfig = {
  frontend: string;
  admin: string;
};

const viewsConfig: ViewsConfig = {
  frontend: path.join(pathConfig.viewsDir, "./frontend"),
  admin: path.join(pathConfig.viewsDir, "./admin"),
};

export default viewsConfig;
