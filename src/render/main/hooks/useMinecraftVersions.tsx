import { useEffect, useState } from "react";

export function useMinecraftVersions(): { versions: string[] } {
  const [versions, setVersions] = useState<string[]>([]);

  useEffect(() => {
    (window as any).versions.getMinecraftVersions().then((versions) => {
      // Put the serialized object into version
      setVersions(
        versions.map((version) => {
          return {
            id: version,
            text: version,
          };
        })
      );
    });
  }, []);

  return { versions };
}
