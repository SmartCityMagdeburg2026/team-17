import { useMemo } from "react";
import {
  hierarchy,
  treemap,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import { type StatisticsHierarchyNode } from "../../types/statistics";

const treemapWidth = 960;
const treemapHeight = 560;

const surfaceByLabel: Record<
  string,
  {
    tileClassName: string;
    eyebrowClassName: string;
    valueClassName: string;
  }
> = {
  "Municipal tax revenue": {
    tileClassName: "bg-[#f7e5db] text-stone-900 ring-[#e7c2ae]",
    eyebrowClassName: "text-[rgba(139,69,19,0.75)]",
    valueClassName: "text-stone-950",
  },
  "Trade tax": {
    tileClassName: "bg-[#f3e8d7] text-stone-900 ring-[#e3d0ad]",
    eyebrowClassName: "text-[rgba(146,64,14,0.72)]",
    valueClassName: "text-stone-950",
  },
  Population: {
    tileClassName: "bg-[#e3ece7] text-stone-900 ring-[#bfd1c7]",
    eyebrowClassName: "text-[rgba(60,90,80,0.72)]",
    valueClassName: "text-stone-950",
  },
  Mobility: {
    tileClassName: "bg-[#dfe6ef] text-stone-900 ring-[#c2cfde]",
    eyebrowClassName: "text-[rgba(71,85,105,0.72)]",
    valueClassName: "text-stone-950",
  },
  Housing: {
    tileClassName: "bg-[#eee6db] text-stone-900 ring-[#d8c8b2]",
    eyebrowClassName: "text-[rgba(120,90,58,0.7)]",
    valueClassName: "text-stone-950",
  },
  Climate: {
    tileClassName: "bg-[#dfe9ec] text-stone-900 ring-[#bfd0d7]",
    eyebrowClassName: "text-[rgba(74,96,110,0.72)]",
    valueClassName: "text-stone-950",
  },
};

function tileSurface(label: string) {
  return (
    surfaceByLabel[label] ?? {
      tileClassName: "bg-stone-100 text-stone-900 ring-stone-200",
      eyebrowClassName: "text-stone-500",
      valueClassName: "text-stone-950",
    }
  );
}

function buildTreemapLeaves(
  rootNode: StatisticsHierarchyNode,
): HierarchyRectangularNode<StatisticsHierarchyNode>[] {
  const root = hierarchy(rootNode)
    .sum((node) => Math.max(node.weight, 0.0001))
    .sort((left, right) => (right.value ?? 0) - (left.value ?? 0));

  const treemapRoot = treemap<StatisticsHierarchyNode>()
    .size([treemapWidth, treemapHeight])
    .paddingOuter(10)
    .paddingTop((node) => (node.depth === 1 && node.children ? 28 : 10))
    .paddingInner(10)
    .round(true)(root);

  return treemapRoot.leaves();
}

export const CityTreemap = ({
  rootNode,
}: {
  rootNode: StatisticsHierarchyNode;
}): React.JSX.Element => {
  const leaves = useMemo(() => buildTreemapLeaves(rootNode), [rootNode]);

  return (
    <div className="rounded-[2rem] bg-white/45 p-4 shadow-[0_16px_40px_rgba(28,25,23,0.05)] backdrop-blur-[2px]">
      <div className="mb-4 flex items-center justify-between px-2">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-stone-500">
            City Snapshot
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Tile area indicates relative weight across the core city indicators
          </p>
        </div>
        <div className="rounded-full bg-white/60 px-3 py-1 text-[0.72rem] font-medium text-muted-foreground">
          Area shown on a log scale
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(244,244,245,0.35))]"
        style={{ aspectRatio: `${treemapWidth} / ${treemapHeight}` }}
      >
        {leaves.map((leaf) => {
          const tileWidth = leaf.x1 - leaf.x0;
          const tileHeight = leaf.y1 - leaf.y0;
          const compact = tileWidth < 170 || tileHeight < 120;
          const surface = tileSurface(leaf.data.label);

          return (
            <div
              key={`${leaf.data.name}-${leaf.data.label}`}
              className={`absolute overflow-hidden rounded-[1.35rem] shadow-[0_10px_24px_rgba(28,25,23,0.04)] transition-transform duration-200 ${surface.tileClassName}`}
              style={{
                left: `${(leaf.x0 / treemapWidth) * 100}%`,
                top: `${(leaf.y0 / treemapHeight) * 100}%`,
                width: `${((leaf.x1 - leaf.x0) / treemapWidth) * 100}%`,
                height: `${((leaf.y1 - leaf.y0) / treemapHeight) * 100}%`,
              }}
            >
              <div className="flex h-full flex-col justify-between p-4 sm:p-5">
                <div>
                  <p
                    className={`text-[0.68rem] font-medium uppercase tracking-[0.08em] ${surface.eyebrowClassName}`}
                  >
                    {leaf.parent?.data.label ?? rootNode.label}
                  </p>
                  <h3 className="mt-2 text-base font-semibold tracking-tight text-balance sm:text-lg">
                    {leaf.data.label}
                  </h3>
                  <p
                    className={`mt-3 text-xl font-semibold tracking-tight sm:text-[1.65rem] ${surface.valueClassName}`}
                  >
                    {leaf.data.displayValue}
                  </p>
                </div>

                {!compact && (
                  <p className="max-w-[22ch] text-xs leading-5 text-stone-600">
                    {leaf.data.source}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
