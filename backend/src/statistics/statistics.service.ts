import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import {
  StatisticsHierarchyNode,
  StatisticsSegment,
  StatisticsSummary,
  StatisticsTrendPoint,
} from './statistics.types';

type DatasetRow = Record<string, string | number | null>;
type DatasetFile = {
  title?: string;
  rows: DatasetRow[];
};
type CsvRow = Record<string, string | number>;

const numberFormatter = new Intl.NumberFormat('de-DE');
const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const trendStartYear = 2010;
const householdPalette = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];
const rentPalette = ['#115e59', '#0f766e', '#14b8a6', '#5eead4'];
const climatePalette = [
  '#083344',
  '#0f766e',
  '#14b8a6',
  '#2dd4bf',
  '#99f6e4',
  '#fde68a',
  '#fbbf24',
  '#f59e0b',
  '#f97316',
  '#ea580c',
  '#c2410c',
  '#7c2d12',
];
function resolveWorkspaceRoot() {
  return process.cwd().endsWith(`${sep}backend`)
    ? join(process.cwd(), '..')
    : process.cwd();
}

const workspaceRoot = resolveWorkspaceRoot();
const rawDataRoot = existsSync(join(workspaceRoot, 'backend', 'data', 'raw'))
  ? join(workspaceRoot, 'backend', 'data', 'raw')
  : join(process.cwd(), 'data', 'raw');
const curatedDataRoot = join(workspaceRoot, 'data');

function readJson<T>(basePath: string, ...pathSegments: string[]): T {
  const filePath = join(basePath, ...pathSegments);
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function readCsv(...pathSegments: string[]): CsvRow[] {
  const filePath = join(curatedDataRoot, ...pathSegments);
  const [headerLine, ...lines] = readFileSync(filePath, 'utf8')
    .trim()
    .split(/\r?\n/);
  const headers = headerLine.split(',');

  return lines.map((line) => {
    const values = line.split(',');

    return headers.reduce<CsvRow>((row, header, index) => {
      const value = values[index] ?? '';
      const parsedNumber = Number(value);
      row[header] =
        value !== '' && !Number.isNaN(parsedNumber) ? parsedNumber : value;
      return row;
    }, {});
  });
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDefinedNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

function translateMonthLabel(month: string): string {
  const monthByGermanLabel: Record<string, string> = {
    Januar: 'January',
    Februar: 'February',
    März: 'March',
    April: 'April',
    Mai: 'May',
    Juni: 'June',
    Juli: 'July',
    August: 'August',
    September: 'September',
    Oktober: 'October',
    November: 'November',
    Dezember: 'December',
  };

  return monthByGermanLabel[month] ?? month;
}

function getLatestRowByYear<T extends DatasetRow>(rows: T[]): T {
  return rows.reduce((latestRow, row) =>
    Number(row.var1 ?? row.jahr ?? row.year ?? 0) >
    Number(latestRow.var1 ?? latestRow.jahr ?? latestRow.year ?? 0)
      ? row
      : latestRow,
  );
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, digits = 1): number {
  return Number(value.toFixed(digits));
}

function getDistrictValue(row: CsvRow, key: string): number | null {
  const value = row[key];
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const normalizedValue = String(value ?? '').trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getDistrictName(row: CsvRow): string {
  return String(row.Stadtteil ?? '').trim();
}

function getRowYear(row: CsvRow): number | null {
  const value = row.Jahr ?? row.jahr ?? row.year ?? row.var1;
  const year = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(year) ? year : null;
}

function filterRowsToLatestYear(rows: CsvRow[]): CsvRow[] {
  const years = rows.map(getRowYear).filter(isDefinedNumber);

  if (years.length === 0) {
    return rows;
  }

  const latestYear = Math.max(...years);

  return rows.filter((row) => getRowYear(row) === latestYear);
}

function getWomenShare(row: CsvRow): number | null {
  const women = getDistrictValue(row, 'Frauen');
  const total = getDistrictValue(row, 'Gesamt');

  if (!isDefinedNumber(women) || !isDefinedNumber(total) || total <= 0) {
    return null;
  }

  return (women / total) * 100;
}

function normalizeDistrictName(district: string): string {
  return district.replace(/\s+/g, ' ').trim();
}

@Injectable()
export class StatisticsService {
  private readonly summary: StatisticsSummary = this.buildSummary();

  getSummary(): StatisticsSummary {
    return this.summary;
  }

  private buildSummary(): StatisticsSummary {
    const districtOptions = this.getDistrictOptions();
    const populationDataset = readJson<DatasetFile>(
      rawDataRoot,
      'kiss-md',
      'json',
      'bevoelkerung',
      'bevoelkerung-mit-hauptwohnsitz-nach-alter-und-geschlecht.json',
    );
    const populationYear = Math.max(
      ...populationDataset.rows.map((row) => Number(row.var1)),
    );
    const populationRow =
      populationDataset.rows.find(
        (row) =>
          Number(row.var1) === populationYear &&
          String(row.var2) === 'Einwohner insgesamt',
      ) ?? getLatestRowByYear(populationDataset.rows);
    const populationTotal = Number(
      populationRow.var3 ?? populationRow.var8 ?? 0,
    );
    const populationSeries = this.buildPopulationSeries(populationDataset.rows);

    const taxDataset = readJson<DatasetFile>(
      rawDataRoot,
      'steuereinnahmen',
      'json',
      'steuereinnahmen-2010-2025.json',
    );
    const taxRow = getLatestRowByYear(taxDataset.rows);
    const taxYear = Number(taxRow.jahr);
    const taxTotal = this.sumNumbers(taxRow);
    const tradeTax = Number(taxRow.gewerbesteuer ?? 0);
    const taxSeries = taxDataset.rows.map((row) => ({
      year: Number(row.jahr),
      taxes: this.sumNumbers(row),
      tradeTax: Number(row.gewerbesteuer ?? null),
    }));

    const rentDataset = readJson<DatasetFile>(
      rawDataRoot,
      'mietspiegel-2024',
      'nach-wohnflaeche.json',
    );
    const rentYear = Math.max(...rentDataset.rows.map((row) => Number(row.year)));
    const rentRows = rentDataset.rows.filter(
      (row) => Number(row.year) === rentYear,
    );
    const rentValues = rentRows.filter((row) =>
      isNumber(row.nettokaltmiete_pro_qm),
    );
    const rentSampleWeight = rentValues.reduce(
      (sum, row) => sum + Number(row.stichprobengroesse ?? 0),
      0,
    );
    const rentWeightedAverage =
      rentValues.reduce(
        (sum, row) =>
          sum +
          Number(row.nettokaltmiete_pro_qm ?? 0) *
            Number(row.stichprobengroesse ?? 0),
        0,
      ) / rentSampleWeight;
    const rentSeries = this.buildRentSeries(rentDataset.rows);

    const climateDataset = readJson<DatasetFile>(
      rawDataRoot,
      'sensor-data',
      'json',
      'klima-monat.json',
    );
    const climateRow = climateDataset.rows.at(-1);
    const climateDate = String(climateRow?.date ?? '');
    const climateTemperature = Number(climateRow?.MO_TT ?? 0);
    const climateSeries = this.buildClimateSeries(climateDataset.rows);

    const vehicleDataset = readJson<DatasetFile>(
      rawDataRoot,
      'kiss-md',
      'json',
      'verkehr',
      'kraftfahrzeugbestand-monatlich.json',
    );
    const vehicleRow = vehicleDataset.rows.at(-1);
    const vehicleYear = Number(vehicleRow?.var1 ?? 0);
    const vehicleMonth = String(vehicleRow?.var2 ?? '');
    const vehicleCount = Number(vehicleRow?.var3 ?? 0);
    const vehicleSeries = this.buildVehicleSeries(vehicleDataset.rows);
    const trends = this.mergeTrends(
      populationSeries,
      taxSeries,
      rentSeries,
      climateSeries,
      vehicleSeries,
    );

    return {
      generatedAt: new Date().toISOString(),
      cards: [
        {
          id: 'population',
          label: 'Population with primary residence',
          value: `${formatNumber(populationTotal)} residents`,
          note: `Reported for ${populationYear} in the KISS-MD city statistics dataset`,
          source:
            'KISS-MD | Population with primary residence by age and gender',
        },
        {
          id: 'taxes',
          label: 'Municipal tax revenue',
          value: `${formatCurrency(taxTotal)}`,
          note: `Total reported tax revenue for ${taxYear}`,
          source: 'City of Magdeburg | Tax revenue 2010-2025',
        },
        {
          id: 'trade-tax',
          label: 'Trade tax',
          value: `${formatCurrency(tradeTax)}`,
          note: `Largest single tax category in ${taxYear}`,
          source: 'City of Magdeburg | Tax revenue 2010-2025',
        },
        {
          id: 'rent',
          label: 'Average rent',
          value: `${formatDecimal(rentWeightedAverage)} EUR/m2`,
          note: `Weighted average across the published floor-area categories for ${rentYear}`,
          source: 'City of Magdeburg | Rent index 2024',
        },
        {
          id: 'climate',
          label: 'Monthly average temperature',
          value: `${formatDecimal(climateTemperature)} deg C`,
          note: `DWD climate station 03126 | ${climateDate.slice(0, 7)}`,
          source: 'DWD | Magdeburg climate sensor data',
        },
        {
          id: 'vehicles',
          label: 'Registered vehicles',
          value: `${formatNumber(vehicleCount)} vehicles`,
          note: `Monthly position for ${translateMonthLabel(vehicleMonth)} ${vehicleYear}`,
          source: 'KISS-MD | Monthly vehicle stock',
        },
      ],
      trends,
      hierarchy: this.buildHierarchy({
        populationTotal,
        taxTotal,
        tradeTax,
        rentWeightedAverage,
        climateTemperature,
        vehicleCount,
      }),
      districtOptions,
      demographicsRadar: this.buildDemographicsRadar(districtOptions),
      householdByDistrict: this.buildHouseholdByDistrict(districtOptions),
      rentBySize: this.buildRentBySize(rentDataset.rows, districtOptions),
      rentByBuildingAge: this.buildRentByBuildingAge(districtOptions),
      taxComposition: this.buildTaxComposition(taxRow),
      climateSeasonality: this.buildClimateSeasonality(climateDataset.rows),
    };
  }

  private getDistrictOptions(): string[] {
    const rows = filterRowsToLatestYear(
      readCsv('Bevölkerung', 'Bevoelkerung_ausgewaehlte_Indikatoren.csv'),
    );

    return [...new Set(rows.map(getDistrictName).map(normalizeDistrictName))]
      .filter((district) => district.length > 0 && district !== 'Magdeburg')
      .sort((left, right) => left.localeCompare(right, 'de'));
  }

  private sumNumbers(row: DatasetRow): number {
    return Object.entries(row).reduce<number>((sum, [key, value]) => {
      if (key === 'jahr' || key === 'year' || key === 'var1') {
        return sum;
      }

      if (isNumber(value)) {
        return sum + value;
      }

      return sum;
    }, 0);
  }

  private buildPopulationSeries(rows: DatasetRow[]): StatisticsTrendPoint[] {
    const byYear = new Map<number, number>();

    for (const row of rows) {
      const year = Number(row.var1);
      const month = String(row.var2 ?? '');
      const value = Number(row.var5 ?? row.var3 ?? null);

      if (month === 'Dezember' && isNumber(value)) {
        byYear.set(year, value);
      }
    }

    return [...byYear.entries()].map(([year, population]) => ({
      year,
      population,
    }));
  }

  private buildRentSeries(rows: DatasetRow[]): StatisticsTrendPoint[] {
    const byYear = new Map<number, { weightedSum: number; weight: number }>();

    for (const row of rows) {
      const year = Number(row.year);
      const value = row.nettokaltmiete_pro_qm;
      const weight = Number(row.stichprobengroesse ?? 0);

      if (!isNumber(value) || !weight) {
        continue;
      }

      const current = byYear.get(year) ?? { weightedSum: 0, weight: 0 };
      current.weightedSum += value * weight;
      current.weight += weight;
      byYear.set(year, current);
    }

    return [...byYear.entries()].map(([year, state]) => ({
      year,
      rent: state.weightedSum / state.weight,
    }));
  }

  private buildClimateSeries(rows: DatasetRow[]): StatisticsTrendPoint[] {
    const byYear = new Map<number, { sum: number; count: number }>();

    for (const row of rows) {
      const year = Number(String(row.date ?? '').slice(0, 4));
      const value = row.MO_TT;

      if (!isNumber(value) || Number.isNaN(year)) {
        continue;
      }

      const current = byYear.get(year) ?? { sum: 0, count: 0 };
      current.sum += value;
      current.count += 1;
      byYear.set(year, current);
    }

    return [...byYear.entries()].map(([year, state]) => ({
      year,
      climate: state.sum / state.count,
    }));
  }

  private buildVehicleSeries(rows: DatasetRow[]): StatisticsTrendPoint[] {
    const byYear = new Map<number, number>();

    for (const row of rows) {
      const year = Number(row.var1);
      const month = String(row.var2 ?? '');
      const value = Number(row.var3 ?? null);

      if (month === 'Dezember' && isNumber(value)) {
        byYear.set(year, value);
      }
    }

    return [...byYear.entries()].map(([year, vehicles]) => ({
      year,
      vehicles,
    }));
  }

  private mergeTrends(
    populationSeries: StatisticsTrendPoint[],
    taxSeries: Array<StatisticsTrendPoint & { tradeTax: number }>,
    rentSeries: StatisticsTrendPoint[],
    climateSeries: StatisticsTrendPoint[],
    vehicleSeries: StatisticsTrendPoint[],
  ): StatisticsTrendPoint[] {
    const points = new Map<number, StatisticsTrendPoint>();

    for (const series of [
      populationSeries,
      taxSeries,
      rentSeries,
      climateSeries,
      vehicleSeries,
    ]) {
      for (const point of series) {
        const current = points.get(point.year) ?? { year: point.year };
        points.set(point.year, { ...current, ...point });
      }
    }

    return [...points.values()]
      .filter((point) => point.year >= trendStartYear)
      .sort((left, right) => left.year - right.year);
  }

  private buildHierarchy(values: {
    populationTotal: number;
    taxTotal: number;
    tradeTax: number;
    rentWeightedAverage: number;
    climateTemperature: number;
    vehicleCount: number;
  }): StatisticsHierarchyNode {
    return {
      name: 'Magdeburg',
      label: 'Magdeburg',
      rawValue: 0,
      weight: 1,
      displayValue: 'City snapshot',
      source: 'Combined from KISS-MD, rent index, and DWD datasets',
      children: [
        {
          name: 'Population',
          label: 'Population',
          rawValue: values.populationTotal,
          weight: Math.log1p(values.populationTotal),
          displayValue: `${formatNumber(values.populationTotal)} residents`,
          source:
            'KISS-MD | Population with primary residence by age and gender',
        },
        {
          name: 'Finance',
          label: 'Finance',
          rawValue: values.taxTotal,
          weight: 0.001,
          displayValue: `${formatCurrency(values.taxTotal)}`,
          source: 'City of Magdeburg | Tax revenue 2010-2025',
          children: [
            {
              name: 'Tax total',
              label: 'Municipal tax revenue',
              rawValue: values.taxTotal,
              weight: Math.log1p(values.taxTotal),
              displayValue: `${formatCurrency(values.taxTotal)}`,
              source: 'City of Magdeburg | Tax revenue 2010-2025',
            },
            {
              name: 'Trade tax',
              label: 'Trade tax',
              rawValue: values.tradeTax,
              weight: Math.log1p(values.tradeTax),
              displayValue: `${formatCurrency(values.tradeTax)}`,
              source: 'City of Magdeburg | Tax revenue 2010-2025',
            },
          ],
        },
        {
          name: 'Housing',
          label: 'Housing',
          rawValue: values.rentWeightedAverage,
          weight: Math.log1p(values.rentWeightedAverage * 100),
          displayValue: `${formatDecimal(values.rentWeightedAverage)} EUR/m2`,
          source: 'City of Magdeburg | Rent index 2024',
        },
        {
          name: 'Mobility',
          label: 'Mobility',
          rawValue: values.vehicleCount,
          weight: Math.log1p(values.vehicleCount),
          displayValue: `${formatNumber(values.vehicleCount)} vehicles`,
          source: 'KISS-MD | Monthly vehicle stock',
        },
        {
          name: 'Climate',
          label: 'Climate',
          rawValue: values.climateTemperature,
          weight: Math.log1p(Math.abs(values.climateTemperature) * 10),
          displayValue: `${formatDecimal(values.climateTemperature)} deg C`,
          source: 'DWD | Magdeburg climate sensor data',
        },
      ],
    };
  }

  private buildDemographicsRadar(districtOptions: string[]) {
    const rows = filterRowsToLatestYear(
      readCsv('Bevölkerung', 'Bevoelkerung_ausgewaehlte_Indikatoren.csv'),
    )
      .filter((row) => districtOptions.includes(getDistrictName(row)));

    const metrics = [
      {
        key: 'shareForeign',
        label: 'International',
        sourceKey: 'Anteil ausländischer Bevölkerung',
      },
      {
        key: 'youthRatio',
        label: 'Youth',
        sourceKey: 'Jugendquote',
      },
      {
        key: 'oldAgeRatio',
        label: 'Senior',
        sourceKey: 'Altenquote',
      },
      {
        key: 'womenShare',
        label: 'Women',
        sourceKey: null,
      },
      {
        key: 'averageAge',
        label: 'Average age',
        sourceKey: 'Altersdurchschnitt',
      },
    ];

    const maxByMetric = new Map<string, number>();

    for (const metric of metrics) {
      const values = rows
        .map((row) =>
          metric.key === 'womenShare'
            ? getWomenShare(row)
            : getDistrictValue(row, metric.sourceKey ?? ''),
        )
        .filter(isDefinedNumber);
      maxByMetric.set(metric.key, Math.max(...values, 1));
    }

    const cityAverage = metrics.reduce<Record<string, number | null>>(
      (accumulator, metric) => {
        const values = rows
          .map((row) =>
            metric.key === 'womenShare'
              ? getWomenShare(row)
              : getDistrictValue(row, metric.sourceKey ?? ''),
          )
          .filter(isDefinedNumber)
          .map((value) => (value / (maxByMetric.get(metric.key) ?? 1)) * 100);

        accumulator[metric.key] =
          values.length > 0 ? round(mean(values)) : null;
        return accumulator;
      },
      {},
    );

    return {
      metrics: metrics.map(({ key, label }) => ({ key, label })),
      cityAverage,
      districts: rows.map((row) => {
        const district = getDistrictName(row);
        const values = metrics.reduce<Record<string, number | null>>(
          (accumulator, metric) => {
            const rawValue =
              metric.key === 'womenShare'
                ? getWomenShare(row)
                : getDistrictValue(row, metric.sourceKey ?? '');
            accumulator[metric.key] = isDefinedNumber(rawValue)
              ? round((rawValue / (maxByMetric.get(metric.key) ?? 1)) * 100)
              : null;
            return accumulator;
          },
          {},
        );

        return {
          district,
          values,
        };
      }),
    };
  }

  private buildHouseholdByDistrict(districtOptions: string[]) {
    const rows = filterRowsToLatestYear(
      readCsv('Bevölkerung', 'Haushaltsangaben.csv'),
    ).filter((row) => districtOptions.includes(getDistrictName(row)));

    return {
      averageSizeByDistrict: rows.reduce<Record<string, number>>(
        (accumulator, row) => {
          const averageSize = getDistrictValue(
            row,
            'durchschnittliche Haushaltsgröße',
          );

          accumulator[getDistrictName(row)] = isDefinedNumber(averageSize)
            ? round(averageSize, 2)
            : 0;
          return accumulator;
        },
        {},
      ),
      districts: rows.map((row) => ({
        district: getDistrictName(row),
        segments: [
          {
            key: 'single',
            label: '1 person',
            value: getDistrictValue(row, 'Haushaltsgröße (1 Person)') ?? 0,
            fill: householdPalette[0],
          },
          {
            key: 'double',
            label: '2 people',
            value: getDistrictValue(row, 'Haushaltsgröße (2 Personen)') ?? 0,
            fill: householdPalette[1],
          },
          {
            key: 'triple',
            label: '3 people',
            value: getDistrictValue(row, 'Haushaltsgröße (3 Personen)') ?? 0,
            fill: householdPalette[2],
          },
          {
            key: 'family',
            label: '4+ people',
            value: getDistrictValue(row, 'Haushaltsgröße (4 und mehr)') ?? 0,
            fill: householdPalette[3],
          },
        ],
      })),
    };
  }

  private buildRentBySize(rows: DatasetRow[], districtOptions: string[]) {
    const year = Math.max(...rows.map((row) => Number(row.year)));

    return {
      year,
      districts: districtOptions.map((district) => {
        const districtRows = rows.filter(
          (row) =>
            Number(row.year) === year && String(row.stadtteil) === district,
        );
        const segmentCandidates: Array<StatisticsSegment | null> = [
          'unter 20qm',
          '20 bis unter 50 qm',
          '50 bis unter 80 qm',
          'ab 80 qm',
        ]
          .map((category, index) => {
            const row = districtRows.find(
              (entry) => String(entry.wohnflaechenklasse) === category,
            );
            const value = Number(row?.nettokaltmiete_pro_qm ?? NaN);

            if (!Number.isFinite(value)) {
              return null;
            }

            return {
              key: category,
              label: category.replace(' bis unter ', '-').replace(' qm', '').replace('unter ', '<'),
              value: round(value, 2),
              fill: rentPalette[index],
            } satisfies StatisticsSegment;
          });
        const segments = segmentCandidates.filter(
          (segment): segment is StatisticsSegment => segment !== null,
        );

        return {
          district,
          averageRent: round(mean(segments.map((segment) => segment.value)), 2),
          segments,
        };
      }),
    };
  }

  private buildRentByBuildingAge(districtOptions: string[]) {
    const dataset = readJson<DatasetFile>(curatedDataRoot, 'nach-baualter.json');
    const year = Math.max(...dataset.rows.map((row) => Number(row.year)));
    const categories = [
      { source: 'vor 1925', label: 'Before 1925' },
      { source: '1926 - 1959', label: '1926 - 1959' },
      { source: '1960 - 1992', label: '1960 - 1992' },
      { source: '1993 - 2002', label: '1993 - 2002' },
      { source: '2003 - 2014', label: '2003 - 2014' },
      { source: 'ab 2015', label: 'From 2015' },
    ];

    return {
      year,
      categories: categories.map((category) => category.label),
      cityAverage: categories.reduce<Record<string, number | null>>(
        (accumulator, category) => {
          const values = dataset.rows
            .filter(
              (row) =>
                Number(row.year) === year &&
                String(row.baualtersklasse) === category.source &&
                isNumber(row.nettokaltmiete_pro_qm),
            )
            .map((row) => Number(row.nettokaltmiete_pro_qm));
          accumulator[category.label] =
            values.length > 0 ? round(mean(values), 2) : null;
          return accumulator;
        },
        {},
      ),
      districts: districtOptions.map((district) => {
        const districtRows = dataset.rows.filter(
          (row) =>
            Number(row.year) === year && String(row.stadtteil) === district,
        );

        return {
          district,
          values: categories.reduce<Record<string, number | null>>(
            (accumulator, category) => {
              const row = districtRows.find(
                (entry) => String(entry.baualtersklasse) === category.source,
              );
              const value = row?.nettokaltmiete_pro_qm;
              accumulator[category.label] = isNumber(value) ? round(value, 2) : null;
              return accumulator;
            },
            {},
          ),
        };
      }),
    };
  }

  private buildTaxComposition(row: DatasetRow) {
    const segments: StatisticsSegment[] = [
      {
        key: 'gewerbesteuer',
        label: 'Trade tax',
        value: Number(row.gewerbesteuer ?? 0),
        fill: '#e84e0e',
      },
      {
        key: 'einkommensteuer',
        label: 'Income tax share',
        value: Number(row['gemeindeanteil-an-der-einkommensteuer'] ?? 0),
        fill: '#f59e0b',
      },
      {
        key: 'umsatzsteuer',
        label: 'Sales tax share',
        value: Number(row['gemeindeanteil-an-der-umsatzsteuer'] ?? 0),
        fill: '#fbbf24',
      },
      {
        key: 'grundsteuer',
        label: 'Property tax',
        value:
          Number(row['grundsteuer-a'] ?? 0) +
          Number(row['grundsteuer-b-bis-2024'] ?? 0) +
          Number(row['grundsteuer-b-ab-2025-wohngrundstuecke'] ?? 0) +
          Number(row['grundsteuer-b-ab-2025-nichtwohngrundstuecke'] ?? 0),
        fill: '#d97706',
      },
    ];
    const total = this.sumNumbers(row);
    const other = total - segments.reduce((sum, segment) => sum + segment.value, 0);

    return {
      year: Number(row.jahr),
      segments: [
        ...segments,
        {
          key: 'other',
          label: 'Other',
          value: other,
          fill: '#fed7aa',
        },
      ],
    };
  }

  private buildClimateSeasonality(rows: DatasetRow[]) {
    const byYear = new Map<number, DatasetRow[]>();

    for (const row of rows) {
      const year = Number(String(row.date ?? '').slice(0, 4));
      if (!isNumber(row.MO_TT)) {
        continue;
      }

      const current = byYear.get(year) ?? [];
      current.push(row);
      byYear.set(year, current);
    }

    const latestCompleteYear = [...byYear.entries()]
      .filter(([, entries]) => entries.length >= 12)
      .sort((left, right) => left[0] - right[0])
      .at(-1);
    const year = latestCompleteYear?.[0] ?? 0;
    const months = (latestCompleteYear?.[1] ?? [])
      .sort((left, right) =>
        String(left.date).localeCompare(String(right.date)),
      )
      .slice(0, 12)
      .map((row, index) => ({
        month: new Date(String(row.date)).toLocaleString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        }),
        value: round(Number(row.MO_TT ?? 0), 1),
        fill: climatePalette[index],
      }));

    return {
      year,
      metricLabel: 'Average temperature',
      months,
    };
  }
}
