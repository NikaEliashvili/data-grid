import { faker } from "@faker-js/faker";
import type { GridRow } from "@/types/grid";

export function generateRows(count: number): GridRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }),
    salary: faker.number.int({ min: 1000, max: 15000 }),
    country: faker.location.country(),
    department: faker.commerce.department(),
    isActive: faker.datatype.boolean(),
  }));
}
