import path from "path";
import pathConfig from "./paths";

type ViewsConfig = {
  frontend: string;
};

const viewsConfig: ViewsConfig = {
  frontend: path.join(pathConfig.viewsDir, "./frontend"),
};

export default viewsConfig;
