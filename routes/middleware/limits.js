import { rateLimit } from "express-rate-limit";

const ratelimit = {
  login: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 50,
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  }),
  registration: rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    limit: 50,
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  }),
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000,
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  }),
};

export default ratelimit;
