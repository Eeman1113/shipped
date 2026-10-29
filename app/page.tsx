import { APPS, UPDATED, YEAR, YEARS } from "./apps";
import Shipped from "./Shipped";

export default function Home() {
  return <Shipped apps={APPS} years={YEARS} currentYear={YEAR} updated={UPDATED} />;
}
