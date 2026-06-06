import React, { useMemo } from "react";
import { useSidebar } from "../SidebarProvider";
import { getChildrenPerPlayground } from "@/lib/playgrounds";

const PlaygroundChildren = (): React.JSX.Element => {
  const { elements, districtData } = useSidebar();

  const { childrenPerPlayground, playgrounds } = useMemo(
    () => getChildrenPerPlayground(elements, districtData),
    [elements, districtData],
  );

  return (
    <div>
      {playgrounds?.length === 0 ? (
        <p>No playgrounds found.</p>
      ) : (
        <ul>{childrenPerPlayground} children per Playground</ul>
      )}
    </div>
  );
};

export default PlaygroundChildren;
