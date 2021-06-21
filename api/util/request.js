// Get the clients ip
const getClientIp = (req) =>
  (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
  req.socket.remoteAddress;
