import { listBottles } from "@/lib/db";
import { rackDimensions, unplacedBottles } from "@/lib/bottles";
import OrganizarClient from "./OrganizarClient";

export const dynamic = "force-dynamic";

export default async function OrganizarPage() {
  const bottles = await listBottles();
  const unplaced = unplacedBottles(bottles);
  const placed = bottles.filter((b) => b.position);

  const racks = Array.from(
    new Set(placed.map((b) => b.position!.rack)),
  ).sort();
  const dims = rackDimensions(placed);

  const availableRacks = racks.length > 0 ? racks : ["A"];
  const maxRows = Math.max(2, dims.rows);
  const maxCols = Math.max(3, dims.cols);

  return (
    <OrganizarClient
      bottles={unplaced}
      availableRacks={availableRacks}
      maxRows={maxRows}
      maxCols={maxCols}
    />
  );
}
