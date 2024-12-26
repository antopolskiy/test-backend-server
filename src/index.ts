import express, { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import cors from "cors";
import { User } from "./types";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

function generateUser(): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    },
    company: faker.company.name(),
    jobTitle: faker.person.jobTitle(),
    avatar: faker.image.avatar(),
  };
}

app.get("/api/user", (_req: Request, res: Response) => {
  res.json(generateUser());
});

app.get("/api/users/:count", (req: Request, res: Response) => {
  const count = parseInt(req.params.count) || 10;
  const limitedCount = Math.min(count, 100);

  const users = Array.from({ length: limitedCount }, generateUser);
  res.json(users);
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
