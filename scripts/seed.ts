import "./load-env";
import { seedUsers } from "./seed/users";
import { seedContent } from "./seed/content";
import { seedReservations } from "./seed/reservations";

async function main() {
  await seedUsers();
  await seedContent();
  await seedReservations();
  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
