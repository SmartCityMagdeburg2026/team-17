export type StatisticsCard = {
  id: string;
  label: string;
  value: string;
  note: string;
  source: string;
};

export type StatisticsSegment = {
  key: string;
  label: string;
  value: number;
  fill?: string;
};

export type StatisticsTrendPoint = {
  year: number;
  population?: number | null;
  taxes?: number | null;
  rent?: number | null;
  climate?: number | null;
  vehicles?: number | null;
};

export type StatisticsHierarchyNode = {
  name: string;
  label: string;
  rawValue: number;
  weight: number;
  displayValue: string;
  source: string;
  children?: StatisticsHierarchyNode[];
};

export type StatisticsSummary = {
  generatedAt: string;
  cards: StatisticsCard[];
  trends: StatisticsTrendPoint[];
  hierarchy: StatisticsHierarchyNode;
  districtOptions: string[];
  demographicsRadar: {
    metrics: Array<{
      key: string;
      label: string;
    }>;
    cityAverage: Record<string, number | null>;
    districts: Array<{
      district: string;
      values: Record<string, number | null>;
    }>;
  };
  householdByDistrict: {
    averageSizeByDistrict: Record<string, number>;
    districts: Array<{
      district: string;
      segments: StatisticsSegment[];
    }>;
  };
  rentBySize: {
    year: number;
    districts: Array<{
      district: string;
      averageRent: number;
      segments: StatisticsSegment[];
    }>;
  };
  rentByBuildingAge: {
    year: number;
    categories: string[];
    cityAverage: Record<string, number | null>;
    districts: Array<{
      district: string;
      values: Record<string, number | null>;
    }>;
  };
  taxComposition: {
    year: number;
    segments: StatisticsSegment[];
  };
  climateSeasonality: {
    year: number;
    metricLabel: string;
    months: Array<{
      month: string;
      value: number;
      fill: string;
    }>;
  };
};
