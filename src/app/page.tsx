import { OrbyteExperience } from "@/scene/orbyte-experience";
import { getUniverseData } from "@/lib/server/universe-service";

export default async function Home() {
  const universe = await getUniverseData();

  return <OrbyteExperience universe={universe} />;
}
