import { getNormallyDistributedRandomNumber, weightedRandom } from "./utils";

// TODO colors
const TIERS = [
  {
    weight: 14,
    color: "#4CAF50",
  },
  { weight: 5, color: "#2196F3" },
  { weight: 1, color: "#E91E63" },
] as const;

const QUALITIES = {
  dirty: {
    weight: 5,
    multiplier: 2,
    name: "Dirty",
  },
  clean: {
    weight: 3,
    multiplier: 3,
    name: "Clean",
  },
  shiny: {
    weight: 2,
    multiplier: 5,
    name: "Shiny",
  },
} as const;

const SPECIES = {
  anchovy: { tier: 0, weight: 1, name: "Anchovy", multiplier: 5 },
  sardine: { tier: 0, weight: 1, name: "Sardine", multiplier: 5 },
  mackerel: { tier: 0, weight: 1, name: "Mackerel", multiplier: 5 },
  minnow: { tier: 0, weight: 1, name: "Minnow", multiplier: 5 },
  flatfish: { tier: 0, weight: 1, name: "Flatfish", multiplier: 5 },
  herring: { tier: 0, weight: 1, name: "Herring", multiplier: 5 },
  halibut: { tier: 0, weight: 1, name: "Halibut", multiplier: 5 },
  chub: { tier: 0, weight: 1, name: "Chub", multiplier: 5 },
  hake: { tier: 0, weight: 1, name: "Hake", multiplier: 5 },
  salmon: { tier: 1, weight: 1, name: "Salmon", multiplier: 14 },
  haddock: { tier: 1, weight: 1, name: "Haddock", multiplier: 14 },
  cod: { tier: 1, weight: 1, name: "Cod", multiplier: 14 },
  trout: { tier: 1, weight: 1, name: "Trout", multiplier: 14 },
  catfish: { tier: 1, weight: 1, name: "Catfish", multiplier: 14 },
  barjack: { tier: 1, weight: 1, name: "Bar Jack", multiplier: 14 },
  koi: { tier: 2, weight: 1, name: "Koi Carp", multiplier: 50 },
  flying: { tier: 2, weight: 1, name: "Flying Fish", multiplier: 50 },
  rainbow: { tier: 2, weight: 1, name: "Rainbow Fish", multiplier: 100 },
  angel: { tier: 2, weight: 1, name: "Angel Fish", multiplier: 50 },
  fugu: { tier: 2, weight: 1, name: "Fugu Fish", multiplier: 75 },
} as const;

type FishQuality = keyof typeof QUALITIES;
type FishSpecies = keyof typeof SPECIES;

export interface Fish {
  species: FishSpecies;
  quality: FishQuality;
  weight: number;
  score: number;
  name: string;
  color: string;
}

// TODO allow custom weight manipulation i.e. move the centre of the bell curve for fish weight, double chance of high tier fish etc.
export function makeFishFactory(): () => Fish {
  // Find the sum of the fish species weights * the weight of its tier
  const sumSpeciesWeight = Object.values(SPECIES)
    .map((v) => v.weight * TIERS[v.tier].weight)
    .reduce((p, c) => p + c, 0);

  // Reweight each species proportionally
  const reweightedSpecies = Object.fromEntries(
    Object.entries(SPECIES).map(([k, v]) => {
      return [
        k,
        { ...v, weight: (v.weight * TIERS[v.tier].weight) / sumSpeciesWeight },
      ];
    })
  );

  const sumQualitiesWeight = Object.values(QUALITIES)
    .map((v) => v.weight)
    .reduce((p, c) => p + c, 0);

  const reweightedQualities = Object.fromEntries(
    Object.entries(QUALITIES).map(([k, v]) => {
      return [k, { ...v, weight: v.weight / sumQualitiesWeight }];
    })
  );

  return () => {
    const species = weightedRandom(reweightedSpecies) as FishSpecies;
    const quality = weightedRandom(reweightedQualities) as FishQuality;
    const weight = getNormallyDistributedRandomNumber(10, 3);

    return {
      species,
      quality,
      weight,
      score:
        weight * SPECIES[species].multiplier * QUALITIES[quality].multiplier,
      name: `${QUALITIES[quality].name} ${
        SPECIES[species].name
      } (${weight.toFixed(2)}kg)`,
      // TODO could make this more advanced later i.e. change the hue a bit based on weight - darker = heavier etc.
      color: TIERS[SPECIES[species].tier].color,
    };
  };
}
