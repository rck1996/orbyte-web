import { OrbyteExperience } from "@/scene/orbyte-experience";
import { getUniverseData, getWorkspaceDomain } from "@/lib/server/universe-service";

export default async function ThreeViewPage() {
  const [universe, workspace] = await Promise.all([getUniverseData(), getWorkspaceDomain()]);

  return <OrbyteExperience universe={universe} workspace={workspace} />;
}
