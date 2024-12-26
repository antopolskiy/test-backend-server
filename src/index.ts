import express, { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import cors from "cors";
import { User } from "./types";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// Utility functions for generating chaos
function shouldFail(probability = 0.1): boolean {
  return Math.random() < probability;
}

function getRandomDelay(min = 100, max = 2000): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateUser(includeMalformedData = false): User {
  const user = {
    id: faker.string.uuid(),
    name:
      includeMalformedData && shouldFail(0.3) ? null : faker.person.fullName(),
    email: faker.internet.email(),
    phone:
      includeMalformedData && shouldFail(0.2)
        ? undefined
        : faker.phone.number(),
    address:
      includeMalformedData && shouldFail(0.2)
        ? null
        : {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
          },
    company: faker.company.name(),
    jobTitle:
      includeMalformedData && shouldFail(0.2) ? "" : faker.person.jobTitle(),
    avatar:
      includeMalformedData && shouldFail(0.15)
        ? "https://broken-image-url.com"
        : faker.image.avatar(),
  } as { [K in keyof User]: User[K] };

  // Randomly remove some fields
  if (includeMalformedData && shouldFail(0.1)) {
    delete user.address;
  }

  return user;
}

// Rate limiting state
let requestCount = 0;
const RATE_LIMIT = 50;
const RATE_WINDOW = 60 * 1000; // 1 minute

setInterval(() => {
  requestCount = 0;
}, RATE_WINDOW);

// Middleware for challenge endpoints
const challengeMiddleware = async (
  req: Request,
  res: Response,
  next: Function
) => {
  console.log("challengeMiddleware request path :>> ", req.path);

  // Rate limiting
  requestCount++;
  if (requestCount > RATE_LIMIT) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
  }

  // Random delays
  const delay = getRandomDelay();
  console.log("challengeMiddleware applying delay :>> ", delay);
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Random server errors
  if (shouldFail(0.05)) {
    console.log("challengeMiddleware generating random error");
    return res.status(500).json({ error: "Internal Server Error" });
  }

  next();
};

// Normal endpoints
app.get("/api/user", (_req: Request, res: Response) => {
  res.json(generateUser(false));
});

app.get("/api/users/:count", (req: Request, res: Response) => {
  const count = parseInt(req.params.count) || 10;
  const limitedCount = Math.min(count, 100);
  const users = Array.from({ length: limitedCount }, () => generateUser(false));
  res.json(users);
});

// Challenge endpoints
app.get(
  "/api-challenge/user",
  challengeMiddleware,
  (_req: Request, res: Response) => {
    console.log("getUser generating challenge response");
    res.json(generateUser(true));
  }
);

app.get(
  "/api-challenge/users/:count",
  challengeMiddleware,
  (req: Request, res: Response) => {
    console.log("getUsers generating challenge response");
    const count = parseInt(req.params.count) || 10;
    const limitedCount = Math.min(count, 100);

    // Sometimes return incomplete data
    if (shouldFail(0.1)) {
      const partialCount = Math.floor(limitedCount * 0.7);
      console.log(
        "getUsers returning incomplete data, requested:",
        limitedCount,
        "returning:",
        partialCount
      );
      const users = Array.from({ length: partialCount }, () =>
        generateUser(true)
      );
      return res.json(users);
    }

    const users = Array.from({ length: limitedCount }, () =>
      generateUser(true)
    );
    res.json(users);
  }
);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Challenge health endpoint
app.get(
  "/health-challenge",
  challengeMiddleware,
  (_req: Request, res: Response) => {
    if (shouldFail(0.02)) {
      console.log("health check failing");
      return res.status(503).json({
        status: "degraded",
        message: "Service is experiencing issues",
      });
    }
    res.json({ status: "ok" });
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
