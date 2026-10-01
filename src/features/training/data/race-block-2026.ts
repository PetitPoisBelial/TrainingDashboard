import type {
  LocalDate,
  Pace,
  Target,
  TrainingWeek,
  Workout,
} from "../model/types";

type RepeatWorkoutInput = Readonly<{
  date: LocalDate;
  slug: string;
  title: string;
  count: number;
  effort: Target;
  pace?: Pace;
  recovery?: Target;
  category?: Workout["category"];
  isKeyWorkout?: boolean;
  blockNotes?: string;
  notes?: string;
}>;

function repeatWorkout({
  date,
  slug,
  title,
  count,
  effort,
  pace,
  recovery,
  category = "intervals",
  isKeyWorkout = true,
  blockNotes,
  notes,
}: RepeatWorkoutInput): Workout {
  return {
    id: `${date}-${slug}`,
    scheduledOn: date,
    sport: "running",
    category,
    title,
    isKeyWorkout,
    plannedVolume: {},
    blocks: [
      {
        kind: "repeats",
        count,
        effort,
        pace,
        recovery,
        notes: blockNotes,
      },
    ],
    notes:
      notes ??
      "Échauffement, éducatifs et retour au calme non quantifiés dans le plan source.",
  };
}

function longRun(
  date: LocalDate,
  distanceMeters: number,
  prescribedRange: string,
  notes?: string,
): Workout {
  return {
    id: `${date}-sortie-longue`,
    scheduledOn: date,
    sport: "running",
    category: "long-run",
    title: `Sortie longue ${prescribedRange}`,
    isKeyWorkout: true,
    plannedVolume: { distanceMeters },
    blocks: [
      {
        kind: "segment",
        role: "continuous",
        target: { kind: "distance", meters: distanceMeters },
        notes: `Le plan prescrit ${prescribedRange} ; ${distanceMeters / 1000} km est la valeur médiane retenue pour le format actuel.`,
      },
    ],
    notes,
  };
}

function race(
  date: LocalDate,
  slug: string,
  title: string,
  distanceMeters: number,
  notes: string,
): Workout {
  return {
    id: `${date}-${slug}`,
    scheduledOn: date,
    sport: "running",
    category: "other",
    title,
    isKeyWorkout: true,
    plannedVolume: { distanceMeters },
    blocks: [
      {
        kind: "segment",
        role: "continuous",
        target: { kind: "distance", meters: distanceMeters },
        notes,
      },
    ],
    notes:
      "La catégorie « course » n’existe pas encore dans le modèle ; cette séance utilise temporairement « other ».",
  };
}

function strides(date: LocalDate, slug: string, notes: string): Workout {
  return {
    id: `${date}-${slug}`,
    scheduledOn: date,
    sport: "running",
    category: "other",
    title: "Lignes droites",
    isKeyWorkout: false,
    plannedVolume: {},
    blocks: [
      {
        kind: "segment",
        role: "drills",
        notes,
      },
    ],
    notes:
      "À intégrer de préférence à un footing facile, absent du calendrier source.",
  };
}

/**
 * Projection structurée du bloc semi-marathon puis 10 km, du 7 septembre au
 * 7 décembre 2026.
 *
 * Le texte source ne date pas les séances hors compétitions et ne détaille pas
 * les footings nécessaires pour atteindre les volumes hebdomadaires. Les
 * séances de qualité sont donc placées conventionnellement le mardi et le
 * jeudi, et les sorties longues le dimanche. Les footings non décrits ne sont
 * volontairement pas inventés : les totaux dérivés de ce tableau représentent
 * uniquement les séances explicites, pas les cibles kilométriques de la semaine.
 */
export const raceBlock2026 = [
  {
    id: "2026-09-07",
    startsOn: "2026-09-07",
    workouts: [
      repeatWorkout({
        date: "2026-09-08",
        slug: "seuil-3x10min",
        title: "3 × 8–10 min au seuil",
        count: 3,
        effort: { kind: "duration", seconds: 600 },
        pace: { fast: 218, slow: 222 },
        recovery: { kind: "duration", seconds: 120 },
        category: "tempo",
        blockNotes:
          "Le modèle exige une durée unique : 10 min est retenu dans la plage prescrite de 8 à 10 min.",
        notes:
          "Très contrôlé. Échauffement et retour au calme non quantifiés dans le plan source.",
      }),
      repeatWorkout({
        date: "2026-09-10",
        slug: "stimulation-6x200m",
        title: "Stimulation légère",
        count: 6,
        effort: { kind: "distance", meters: 200 },
        isKeyWorkout: false,
        blockNotes:
          "Rapide mais relâché, avec récupération complète. Le plan autorise à la place quelques lignes droites.",
        notes:
          "L’alternative lignes droites / 6 × 200 m et la durée de récupération ne sont pas structurables avec le modèle actuel.",
      }),
      race(
        "2026-09-13",
        "trail-10km",
        "Trail 10 km",
        10_000,
        "Courir à l’effort. Cette course remplace la deuxième grosse séance et la sortie longue de la semaine.",
      ),
    ],
  },
  {
    id: "2026-09-14",
    startsOn: "2026-09-14",
    workouts: [
      repeatWorkout({
        date: "2026-09-15",
        slug: "vo2-6x800m",
        title: "6 × 800 m",
        count: 6,
        effort: { kind: "distance", meters: 800 },
        pace: { fast: 195, slow: 200 },
        recovery: { kind: "duration", seconds: 90 },
        blockNotes: "Viser 2′36–2′40 par répétition sans finir détruit.",
      }),
      repeatWorkout({
        date: "2026-09-17",
        slug: "seuil-3x12min",
        title: "3 × 12 min au seuil",
        count: 3,
        effort: { kind: "duration", seconds: 720 },
        pace: { fast: 214, slow: 218 },
        recovery: { kind: "duration", seconds: 120 },
        category: "tempo",
        blockNotes:
          "Partir autour de 3′38/km ; descendre vers 3′34–3′35/km uniquement si les sensations sont bonnes.",
      }),
      longRun(
        "2026-09-20",
        22_000,
        "21–23 km",
        "Facile. Possibilité de finir 15–20 min vers SV1 (3′55–4′10/km). Cette option n’est pas décomposée car sa distance est inconnue.",
      ),
    ],
  },
  {
    id: "2026-09-21",
    startsOn: "2026-09-21",
    workouts: [
      repeatWorkout({
        date: "2026-09-22",
        slug: "rapide-10x500m",
        title: "10 × 500 m",
        count: 10,
        effort: { kind: "distance", meters: 500 },
        pace: { fast: 192, slow: 198 },
        recovery: { kind: "duration", seconds: 60 },
        blockNotes: "Viser 1′36–1′39 par répétition. Régulier, sans finir à bloc.",
      }),
      repeatWorkout({
        date: "2026-09-24",
        slug: "long-4x2000m",
        title: "4 × 2 000 m",
        count: 4,
        effort: { kind: "distance", meters: 2_000 },
        pace: { fast: 212, slow: 216 },
        recovery: { kind: "duration", seconds: 120 },
        blockNotes: "Séance importante à courir autour de 3′32–3′36/km.",
      }),
      longRun("2026-09-27", 23_000, "22–24 km", "Courir facile."),
    ],
  },
  {
    id: "2026-09-28",
    startsOn: "2026-09-28",
    workouts: [
      repeatWorkout({
        date: "2026-09-29",
        slug: "rappel-vo2-8x400m",
        title: "8 × 400 m",
        count: 8,
        effort: { kind: "distance", meters: 400 },
        pace: { fast: 190, slow: 195 },
        recovery: { kind: "duration", seconds: 60 },
        blockNotes:
          "Viser 1′16–1′18 par répétition et terminer avec l’envie d’en refaire.",
      }),
      race(
        "2026-10-04",
        "course-10km",
        "10 km de préparation",
        10_000,
        "Courir fort malgré la fatigue du bloc, sans obsession du chrono. Le résultat servira à recalibrer la suite.",
      ),
    ],
  },
  {
    id: "2026-10-05",
    startsOn: "2026-10-05",
    workouts: [
      repeatWorkout({
        date: "2026-10-07",
        slug: "seuil-3x2000m",
        title: "3 × 2 000 m au seuil",
        count: 3,
        effort: { kind: "distance", meters: 2_000 },
        pace: { fast: 215, slow: 218 },
        recovery: { kind: "duration", seconds: 120 },
        category: "tempo",
        blockNotes: "Unique petite séance structurée de la semaine.",
      }),
      {
        id: "2026-10-11-course-20km",
        scheduledOn: "2026-10-11",
        sport: "running",
        category: "tempo",
        title: "20 km progressif",
        isKeyWorkout: true,
        plannedVolume: { distanceMeters: 20_000 },
        blocks: [
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "distance", meters: 6_700 },
            notes: "Premier tiers contrôlé.",
          },
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "distance", meters: 6_600 },
            notes: "Milieu autour de l’allure semi actuelle.",
          },
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "distance", meters: 6_700 },
            notes: "Accélérer progressivement seulement si les sensations sont bonnes.",
          },
        ],
        notes:
          "Grosse séance spécifique semi, pas une course totalement à bloc. RPE final visé : environ 8/10, conservé en note faute de champ dédié.",
      },
    ],
  },
  {
    id: "2026-10-12",
    startsOn: "2026-10-12",
    workouts: [
      repeatWorkout({
        date: "2026-10-13",
        slug: "vo2-6x1000m",
        title: "6 × 1 000 m",
        count: 6,
        effort: { kind: "distance", meters: 1_000 },
        pace: { fast: 195, slow: 198 },
        recovery: { kind: "duration", seconds: 105 },
        blockNotes:
          "Récupération prescrite entre 1′45 et 2′ ; la borne basse est utilisée par le format actuel.",
      }),
      repeatWorkout({
        date: "2026-10-15",
        slug: "seuil-3x15min",
        title: "3 × 15 min au seuil",
        count: 3,
        effort: { kind: "duration", seconds: 900 },
        pace: { fast: 214, slow: 218 },
        recovery: { kind: "duration", seconds: 120 },
        category: "tempo",
      }),
      longRun("2026-10-18", 24_000, "23–25 km", "Courir facile."),
    ],
  },
  {
    id: "2026-10-19",
    startsOn: "2026-10-19",
    workouts: [
      repeatWorkout({
        date: "2026-10-20",
        slug: "semi-4x3000m",
        title: "4 × 3 000 m spécifique semi",
        count: 4,
        effort: { kind: "distance", meters: 3_000 },
        pace: { fast: 211, slow: 215 },
        recovery: { kind: "duration", seconds: 120 },
        blockNotes:
          "Commencer vers 3′35/km et finir éventuellement vers 3′31–3′33/km. Rester maîtrisé.",
      }),
      repeatWorkout({
        date: "2026-10-22",
        slug: "vo2-8x600m",
        title: "8 × 600 m",
        count: 8,
        effort: { kind: "distance", meters: 600 },
        pace: { fast: 190, slow: 195 },
        recovery: { kind: "duration", seconds: 75 },
        blockNotes:
          "Récupération prescrite entre 1′15 et 1′30 ; la borne basse est utilisée par le format actuel.",
      }),
      longRun(
        "2026-10-25",
        25_000,
        "24–26 km",
        "Courir principalement facile.",
      ),
    ],
  },
  {
    id: "2026-10-26",
    startsOn: "2026-10-26",
    workouts: [
      repeatWorkout({
        date: "2026-10-27",
        slug: "seuil-3x4000m",
        title: "3 × 4 000 m au seuil",
        count: 3,
        effort: { kind: "distance", meters: 4_000 },
        pace: { fast: 212, slow: 215 },
        recovery: { kind: "duration", seconds: 150 },
        category: "tempo",
        blockNotes: "Séance centrale de la préparation semi.",
      }),
      repeatWorkout({
        date: "2026-10-29",
        slug: "economie-12x400m",
        title: "12 × 400 m",
        count: 12,
        effort: { kind: "distance", meters: 400 },
        pace: { fast: 190, slow: 195 },
        recovery: { kind: "duration", seconds: 60 },
        blockNotes:
          "Viser 1′16–1′18 par répétition. Chercher l’économie de course, pas la souffrance.",
      }),
      longRun("2026-11-01", 25_000, "24–26 km", "Courir facile."),
    ],
  },
  {
    id: "2026-11-02",
    startsOn: "2026-11-02",
    workouts: [
      repeatWorkout({
        date: "2026-11-03",
        slug: "semi-2x5km",
        title: "2 × 5 km spécifique semi",
        count: 2,
        effort: { kind: "distance", meters: 5_000 },
        pace: { fast: 211, slow: 214 },
        recovery: { kind: "duration", seconds: 180 },
        blockNotes:
          "Séance clé du bloc. Une exécution régulière avec un RPE raisonnable doit rendre l’objectif 1 h 15 crédible.",
      }),
      repeatWorkout({
        date: "2026-11-05",
        slug: "vo2-entretien-6x800m",
        title: "6 × 800 m",
        count: 6,
        effort: { kind: "distance", meters: 800 },
        pace: { fast: 190, slow: 195 },
        recovery: { kind: "duration", seconds: 90 },
        blockNotes:
          "Viser 2′32–2′36. Récupération prescrite entre 1′30 et 1′45 ; la borne basse est utilisée par le format actuel.",
      }),
      longRun("2026-11-08", 22_000, "20–23 km", "Courir facile."),
    ],
  },
  {
    id: "2026-11-09",
    startsOn: "2026-11-09",
    workouts: [
      repeatWorkout({
        date: "2026-11-10",
        slug: "rappel-semi-3x2000m",
        title: "3 × 2 000 m à allure semi",
        count: 3,
        effort: { kind: "distance", meters: 2_000 },
        pace: { fast: 212, slow: 214 },
        recovery: { kind: "duration", seconds: 120 },
        blockNotes: "L’allure doit sembler très facile mentalement.",
      }),
      repeatWorkout({
        date: "2026-11-12",
        slug: "rappel-rapide-6x400m",
        title: "5–6 × 400 m",
        count: 6,
        effort: { kind: "distance", meters: 400 },
        pace: { fast: 193, slow: 193 },
        isKeyWorkout: false,
        blockNotes:
          "Le modèle exige un nombre unique : 6 répétitions sont retenues. Viser environ 1′17 avec une bonne récupération, non quantifiée.",
      }),
      race(
        "2026-11-15",
        "semi-marathon",
        "Semi-marathon objectif",
        21_097.5,
        "Objectif envisagé : 1 h 14 xx à 1 h 15 xx. L’allure exacte doit être décidée après les séances d’octobre et novembre.",
      ),
    ],
  },
  {
    id: "2026-11-16",
    startsOn: "2026-11-16",
    workouts: [
      {
        id: "2026-11-21-seuil-optionnel",
        scheduledOn: "2026-11-21",
        sport: "running",
        category: "tempo",
        title: "Seuil léger optionnel",
        isKeyWorkout: false,
        plannedVolume: {},
        blocks: [
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "duration", seconds: 1_200 },
            notes:
              "Le plan prévoit 20–25 min. La borne basse est retenue par le format actuel.",
          },
        ],
        notes:
          "À réaliser seulement si la récupération du semi est suffisante. Le modèle ne possède pas de statut conditionnel.",
      },
    ],
  },
  {
    id: "2026-11-23",
    startsOn: "2026-11-23",
    workouts: [
      repeatWorkout({
        date: "2026-11-24",
        slug: "10km-5x1200m",
        title: "5 × 1 200 m spécifique 10 km",
        count: 5,
        effort: { kind: "distance", meters: 1_200 },
        pace: { fast: 202, slow: 206 },
        recovery: { kind: "duration", seconds: 120 },
        blockNotes:
          "Courir progressivement autour de 3′22–3′26/km, soit environ 4′02–4′07 par répétition.",
      }),
      strides(
        "2026-11-25",
        "lignes-droites-1",
        "Première petite série de la semaine, uniquement si la récupération est bonne. Nombre et distance non précisés.",
      ),
      repeatWorkout({
        date: "2026-11-26",
        slug: "seuil-2x15min",
        title: "2 × 15–20 min au seuil",
        count: 2,
        effort: { kind: "duration", seconds: 900 },
        pace: { fast: 210, slow: 214 },
        category: "tempo",
        blockNotes:
          "Le modèle exige une durée unique : 15 min est retenu dans la plage prescrite. Récupération non précisée.",
      }),
      strides(
        "2026-11-28",
        "lignes-droites-2",
        "Deuxième petite série de la semaine, uniquement si la récupération est bonne. Nombre et distance non précisés.",
      ),
      longRun(
        "2026-11-29",
        20_000,
        "18–22 km",
        "Le besoin de gros volume long diminue à l’approche du 10 km.",
      ),
    ],
  },
  {
    id: "2026-11-30",
    startsOn: "2026-11-30",
    workouts: [
      repeatWorkout({
        date: "2026-12-01",
        slug: "10km-3x1000m",
        title: "3 × 1 000 m à allure 10 km",
        count: 3,
        effort: { kind: "distance", meters: 1_000 },
        pace: { fast: 204, slow: 204 },
        recovery: { kind: "duration", seconds: 150 },
        blockNotes:
          "Rendre l’allure objectif de 3′24/km familière, sans chercher à produire de fatigue.",
      }),
      repeatWorkout({
        date: "2026-12-04",
        slug: "affutage-6x200m",
        title: "6 × 200 m rapide-relâché",
        count: 6,
        effort: { kind: "distance", meters: 200 },
        isKeyWorkout: false,
        blockNotes:
          "Grosse récupération non quantifiée. Éviter toute accumulation d’acide lactique.",
      }),
    ],
  },
  {
    id: "2026-12-07",
    startsOn: "2026-12-07",
    workouts: [
      race(
        "2026-12-07",
        "10km-objectif",
        "10 km objectif",
        10_000,
        "Choisir entre 34′30, 34′15 ou une tentative sous les 34 minutes selon le 10 km d’octobre, le bloc semi, le semi et les séances récentes.",
      ),
    ],
  },
] as const satisfies readonly TrainingWeek[];

