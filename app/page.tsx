import StatsClient from "@/components/StatsClient";
import { hittingRows } from "@/lib_data";

export default function HomePage() {
  return <StatsClient rows={hittingRows} />;
}
