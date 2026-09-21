import type { CriterionDefinition, DimensionId } from "./types.js";
export declare const DIMENSIONS: ReadonlyArray<{
    id: DimensionId;
    title: string;
    weight: number;
}>;
export declare const CRITERIA: ReadonlyArray<CriterionDefinition>;
export declare function criterionById(id: string): CriterionDefinition | undefined;
//# sourceMappingURL=catalog.d.ts.map