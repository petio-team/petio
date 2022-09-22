import manager from 'cache-manager';
import MongooseStore from "../store/mongoose";

const mongoCache = manager.caching({
  store: MongooseStore,
});

const memoryCache = manager.caching({
  store: 'memory',
  max: 1000,
  ttl: 3600,
});

export default manager.multiCaching([memoryCache, mongoCache]);
