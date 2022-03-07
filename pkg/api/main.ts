require("module-alias")(__dirname);
import("dotenv/config");
import("cache-manager/lib/stores/memory");

import "./src/app/app";
