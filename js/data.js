/* ==========================================================================
   Food Web Rescue Mission — shared content and rules
   Single source of truth for organisms, edges, cascade, topics and quizzes.
   Loaded before app.js. No external dependencies, no network calls.
   ========================================================================== */

window.FWR = (() => {
  "use strict";

  const ORGANISMS = [
    {
      id: "grass",
      name: "Grass",
      emoji: "🌿",
      tier: "T1",
      tierLabel: "Producer",
      role: "Producer",
      food: "Sunlight, water and minerals",
      predators: ["Grasshopper", "Rabbit"],
      fact: "Grass captures sunlight and starts every energy pathway in this web.",
      position: { x: 14, y: 72 },
    },
    {
      id: "grasshopper",
      name: "Grasshopper",
      emoji: "🦗",
      tier: "T2",
      tierLabel: "Primary consumer",
      role: "Primary consumer",
      food: "Grass",
      predators: ["Frog"],
      fact: "A herbivore that turns plant energy into animal tissue.",
      position: { x: 38, y: 84 },
    },
    {
      id: "rabbit",
      name: "Rabbit",
      emoji: "🐇",
      tier: "T2",
      tierLabel: "Primary consumer",
      role: "Primary consumer",
      food: "Grass",
      predators: ["Snake", "Eagle"],
      fact: "A grazer that competes with grasshoppers for grass.",
      position: { x: 40, y: 55 },
    },
    {
      id: "frog",
      name: "Frog",
      emoji: "🐸",
      tier: "T3",
      tierLabel: "Secondary consumer",
      role: "Secondary consumer",
      food: "Grasshoppers",
      predators: ["Snake"],
      fact: "Frogs keep insect numbers in check, linking the grass and snake tiers.",
      position: { x: 66, y: 80 },
    },
    {
      id: "snake",
      name: "Snake",
      emoji: "🐍",
      tier: "T3–T4",
      tierLabel: "Secondary to tertiary consumer",
      role: "Secondary / tertiary consumer",
      food: "Frogs and rabbits",
      predators: ["Eagle"],
      fact: "Its trophic position changes with the chain: T3 when it eats a rabbit, T4 when it eats a frog.",
      position: { x: 68, y: 45 },
    },
    {
      id: "eagle",
      name: "Eagle",
      emoji: "🦅",
      tier: "T3–T4",
      tierLabel: "Apex consumer",
      role: "Tertiary / apex consumer",
      food: "Rabbits and snakes",
      predators: [],
      fact: "An apex consumer in this web. Its exact trophic level depends on which prey it eats.",
      position: { x: 88, y: 20 },
    },
    {
      id: "decomposer",
      name: "Fungi & Bacteria",
      emoji: "🍄",
      tier: "Decomposer",
      tierLabel: "Decomposer",
      role: "Decomposer",
      food: "Dead organic matter",
      predators: [],
      fact: "Decomposers break down dead matter and recycle nutrients. They receive matter from every trophic level, so they sit outside the seven scored energy arrows.",
      position: { x: 14, y: 22 },
    },
  ];

  const ORGANISM_BY_ID = Object.fromEntries(ORGANISMS.map((item) => [item.id, item]));

  const EDGES = [
    { source: "grass", target: "grasshopper", curve: 18 },
    { source: "grass", target: "rabbit", curve: -22 },
    { source: "grasshopper", target: "frog", curve: 16 },
    { source: "frog", target: "snake", curve: 18 },
    { source: "rabbit", target: "snake", curve: -20 },
    { source: "rabbit", target: "eagle", curve: 24 },
    { source: "snake", target: "eagle", curve: 16 },
  ];

  const EDGE_PAIRS = new Set(EDGES.map((edge) => `${edge.source}>${edge.target}`));

  const EXTRA_ORGANISMS = [
    { id: "leaf-litter", name: "Leaf litter", emoji: "🍂", role: "Dead organic matter", food: "Fallen leaves and debris" },
    { id: "earthworm", name: "Earthworm", emoji: "🪱", role: "Detritivore", food: "Leaf litter and soil" },
    { id: "mouse", name: "Mouse", emoji: "🐁", role: "Primary consumer", food: "Grass and seeds" },
    { id: "hawk", name: "Hawk", emoji: "🦅", role: "Apex consumer", food: "Mice and small birds" },
    { id: "algae", name: "Algae", emoji: "🫧", role: "Producer", food: "Sunlight and nutrients" },
    { id: "zooplankton", name: "Zooplankton", emoji: "🦐", role: "Primary consumer", food: "Algae" },
    { id: "fish", name: "Fish", emoji: "🐟", role: "Secondary consumer", food: "Zooplankton" },
    { id: "shark", name: "Shark", emoji: "🦈", role: "Apex consumer", food: "Fish" },
  ];

  const EXTRA_CHAINS = [
    { id: "forest-floor", title: "Forest floor", chain: "🍂 Leaf litter → 🪱 Earthworm → 🐦 Bird → 🦅 Hawk", note: "Decomposition starts the chain and returns nutrients to the soil." },
    { id: "grassland-variant", title: "Grassland variant", chain: "🌿 Grass → 🐁 Mouse → 🦅 Hawk", note: "A shorter chain that still ends at an apex consumer." },
    { id: "pond-sea", title: "Pond / sea", chain: "🫧 Algae → 🦐 Zooplankton → 🐟 Fish → 🦈 Shark", note: "Aquatic food chains follow the same energy rules." },
    { id: "decomposition", title: "Decomposition", chain: "🍂 Dead matter → 🍄 Fungi / 🦠 Bacteria → 🌿 Grass", note: "Decomposers recycle matter back to producers." },
  ];

  const CASCADE = [
    {
      id: "snake",
      name: "Snake",
      emoji: "🐍",
      direction: "removed",
      label: "Removed",
      reason: "The disturbance removes the snake population from this model.",
      before: 100,
      after: 0,
    },
    {
      id: "frog",
      name: "Frog",
      emoji: "🐸",
      direction: "increase",
      label: "Increases",
      reason: "Snakes no longer hunt frogs, so more frogs survive.",
      before: 100,
      after: 145,
    },
    {
      id: "rabbit",
      name: "Rabbit",
      emoji: "🐇",
      direction: "increase",
      label: "Increases",
      reason: "With fewer snakes, fewer rabbits are eaten.",
      before: 100,
      after: 140,
    },
    {
      id: "grasshopper",
      name: "Grasshopper",
      emoji: "🦗",
      direction: "decrease",
      label: "Decreases",
      reason: "More frogs eat more grasshoppers.",
      before: 100,
      after: 62,
    },
    {
      id: "grass",
      name: "Grass",
      emoji: "🌿",
      direction: "decrease",
      label: "Decreases",
      reason: "The rabbit increase adds more grazing pressure than the grasshopper decline removes. In this simplified model, the rabbit effect dominates.",
      before: 100,
      after: 74,
    },
    {
      id: "eagle",
      name: "Eagle",
      emoji: "🦅",
      direction: "slight-decrease",
      label: "Decreases slightly",
      reason: "Eagles lose snakes as prey, and the extra rabbits only partly offset that loss.",
      before: 100,
      after: 91,
    },
  ];

  const CASCADE_BY_ID = Object.fromEntries(CASCADE.map((item) => [item.id, item]));

  const EMERGENCY_OPTIONS = [
    { id: "frog", text: "Frog population increases" },
    { id: "rabbit", text: "Rabbit population increases" },
    { id: "grass", text: "Grass population decreases" },
    { id: "eagle", text: "Eagle population decreases slightly" },
    { id: "stable", text: "The ecosystem remains stable" },
  ];

  const EMERGENCY_CORRECT = new Set(["frog", "rabbit", "grass", "eagle"]);

  const TOPICS = [
    {
      slug: "ecosystem",
      title: "Ecosystem",
      tag: "Foundations",
      summary: "A community of organisms interacting with each other and with their physical environment.",
      explanation: [
        "An ecosystem includes all the living organisms in an area plus the non-living factors they depend on: sunlight, water, air, soil and temperature.",
        "Energy enters most ecosystems as sunlight and leaves mainly as heat. Matter, unlike energy, is recycled.",
      ],
      example: "A grassland with grass, insects, rabbits, snakes, eagles, fungi and soil is one ecosystem.",
      keyPoints: [
        "Biotic factors are living; abiotic factors are non-living.",
        "Energy flows in one direction; nutrients cycle.",
        "Ecosystems are dynamic, not static.",
      ],
      visual: ["☀️", "🌿", "🦗", "🐸", "🐍", "🍄"],
      quiz: {
        question: "Which set contains only abiotic factors?",
        options: ["Grass, rabbit, frog", "Sunlight, water, soil", "Fungi, bacteria, eagle", "Grasshopper, snake, grass"],
        answer: 1,
        why: "Sunlight, water and soil are non-living parts of the environment.",
      },
    },
    {
      slug: "food-chain",
      title: "Food Chain",
      tag: "Feeding relationships",
      summary: "A single path showing how energy passes from one organism to the next.",
      explanation: [
        "A food chain starts with a producer and ends with a top consumer. Each arrow points from the food source to the organism that eats it.",
        "A grassland example is grass → grasshopper → frog → snake.",
      ],
      example: "Grass → Grasshopper → Frog → Snake",
      keyPoints: [
        "Arrows show the direction of energy transfer.",
        "The first link is always a producer.",
        "Real ecosystems contain many overlapping chains.",
      ],
      visual: ["🌿", "🦗", "🐸", "🐍"],
      quiz: {
        question: "In the chain grass → grasshopper → frog, which organism is the producer?",
        options: ["Grass", "Grasshopper", "Frog", "None of them"],
        answer: 0,
        why: "Grass makes its own food using sunlight, so it is the producer.",
      },
    },
    {
      slug: "food-web",
      title: "Food Web",
      tag: "Feeding relationships",
      summary: "Many food chains connected together in one ecosystem.",
      explanation: [
        "A food web shows all the feeding links in a community. Most consumers eat more than one kind of food, so a web is more realistic than a single chain.",
        "Because the links overlap, a change in one species can travel through several paths.",
      ],
      example: "Rabbits eat grass, and both snakes and eagles eat rabbits.",
      keyPoints: [
        "A web is made of interconnected chains.",
        "More links usually mean more resilience.",
        "Arrows still point from food to consumer.",
      ],
      visual: ["🌿", "🦗", "🐇", "🐸", "🐍", "🦅"],
      quiz: {
        question: "Why is a food web more realistic than a single food chain?",
        options: ["It has fewer organisms", "It shows multiple feeding paths", "It removes decomposers", "It only shows producers"],
        answer: 1,
        why: "A web captures the many overlapping feeding relationships in an ecosystem.",
      },
    },
    {
      slug: "producers",
      title: "Producers",
      tag: "Trophic levels",
      summary: "Organisms that make their own food, usually by photosynthesis.",
      explanation: [
        "Producers capture energy from sunlight and store it in organic molecules. They form the base of every food web.",
        "Grass, trees and algae are common producers.",
      ],
      example: "Grass uses sunlight, carbon dioxide and water to make glucose.",
      keyPoints: [
        "Producers occupy the first trophic level (T1).",
        "They supply energy to all consumers.",
        "Photosynthesis also releases oxygen.",
      ],
      visual: ["☀️", "🌿"],
      quiz: {
        question: "Which organism is a producer?",
        options: ["Frog", "Snake", "Grass", "Eagle"],
        answer: 2,
        why: "Grass photosynthesises and makes its own food.",
      },
    },
    {
      slug: "consumers",
      title: "Consumers",
      tag: "Trophic levels",
      summary: "Organisms that obtain energy by eating other organisms.",
      explanation: [
        "Primary consumers eat producers. Secondary consumers eat primary consumers. Tertiary consumers eat secondary consumers.",
        "Some consumers, such as snakes in this web, occupy more than one trophic level depending on what they eat.",
      ],
      example: "Grasshopper (primary) → Frog (secondary) → Snake (tertiary in this chain).",
      keyPoints: [
        "Herbivores are primary consumers.",
        "Carnivores can be secondary or tertiary consumers.",
        "Omnivores feed at more than one level.",
      ],
      visual: ["🌿", "🦗", "🐸", "🐍"],
      quiz: {
        question: "A rabbit eating grass is a…",
        options: ["Producer", "Primary consumer", "Secondary consumer", "Decomposer"],
        answer: 1,
        why: "Rabbits are herbivores, so they are primary consumers.",
      },
    },
    {
      slug: "decomposers",
      title: "Decomposers",
      tag: "Trophic levels",
      summary: "Organisms that break down dead matter and recycle nutrients.",
      explanation: [
        "Fungi and bacteria break down dead plants and animals. They release nutrients such as nitrogen and phosphorus back into the soil.",
        "Decomposers do not form a normal trophic level in a grazing food chain, but they are essential for nutrient cycling.",
      ],
      example: "Fungi breaking down fallen leaves and returning minerals to the soil.",
      keyPoints: [
        "They recycle matter, not energy.",
        "They receive dead matter from every trophic level.",
        "Without them, nutrients would remain locked in waste.",
      ],
      visual: ["🍂", "🍄", "🦠", "🌱"],
      quiz: {
        question: "What is the main role of decomposers?",
        options: ["Make sunlight", "Recycle nutrients from dead matter", "Eat living grass", "Hunt apex predators"],
        answer: 1,
        why: "Decomposers break down dead matter and release nutrients for reuse.",
      },
    },
    {
      slug: "trophic-levels",
      title: "Trophic Levels",
      tag: "Energy",
      summary: "Feeding positions in a food chain, numbered from producers upward.",
      explanation: [
        "T1 contains producers. T2 contains primary consumers. T3 contains secondary consumers, and so on.",
        "An organism's trophic level is not always fixed. A snake eating a rabbit is T3; a snake eating a frog is T4.",
      ],
      example: "Grass T1 → Grasshopper T2 → Frog T3 → Snake T4.",
      keyPoints: [
        "Trophic level = feeding position.",
        "Food webs create flexible trophic positions.",
        "Energy decreases at each higher level.",
      ],
      visual: ["🌿 T1", "🦗 T2", "🐸 T3", "🐍 T4"],
      quiz: {
        question: "A frog that eats grasshoppers occupies which trophic level?",
        options: ["T1", "T2", "T3", "T4"],
        answer: 2,
        why: "Frogs are secondary consumers, so they occupy T3.",
      },
    },
    {
      slug: "energy-flow",
      title: "Energy Flow",
      tag: "Energy",
      summary: "Energy moves from producers to consumers in one direction.",
      explanation: [
        "Energy enters the ecosystem as sunlight and is converted to chemical energy by producers. Consumers obtain it by eating.",
        "At every transfer, much of the energy is used for life processes and released as heat. It cannot be reused by the food web.",
      ],
      example: "Only a small fraction of the energy in grass becomes rabbit tissue.",
      keyPoints: [
        "Energy flow is unidirectional.",
        "Heat loss makes the flow one-way.",
        "Matter cycles, but energy does not.",
      ],
      visual: ["☀️", "🌿", "🐇", "🐍"],
      quiz: {
        question: "Why is energy flow described as unidirectional?",
        options: ["Animals eat only plants", "Heat lost at each transfer cannot be reused", "Decomposers block energy", "Producers eat consumers"],
        answer: 1,
        why: "Heat released during transfers is not available to the food web again.",
      },
    },
    {
      slug: "ten-percent-law",
      title: "10% Law",
      tag: "Energy",
      summary: "About 10% of the energy at one trophic level is transferred to the next.",
      explanation: [
        "Lindeman's 10% rule is a useful approximation: roughly one-tenth of the energy in a trophic level becomes energy in the next level.",
        "The rest is used in respiration, released as heat, lost as waste, or remains uneaten.",
        "The rule is a model, not an exact law for every ecosystem.",
      ],
      example: "10,000 J in producers → 1,000 J in primary consumers → 100 J in secondary consumers → 10 J in tertiary consumers.",
      keyPoints: [
        "About 90% of energy is lost at each step.",
        "Energy pyramids therefore taper sharply.",
        "The 10% value is an approximation.",
      ],
      visual: ["10,000 J", "1,000 J", "100 J", "10 J"],
      quiz: {
        question: "If producers contain 10,000 J, how much reaches primary consumers under the 10% law?",
        options: ["10 J", "100 J", "1,000 J", "9,000 J"],
        answer: 2,
        why: "10% of 10,000 J is 1,000 J.",
      },
    },
    {
      slug: "ecological-pyramids",
      title: "Ecological Pyramids",
      tag: "Energy",
      summary: "Diagrams showing numbers, biomass or energy at each trophic level.",
      explanation: [
        "A pyramid of numbers counts organisms. A pyramid of biomass measures living mass. A pyramid of energy measures energy flow over time.",
        "The pyramid of energy is always upright because energy decreases at every transfer.",
        "Number and biomass pyramids can sometimes be inverted.",
      ],
      example: "A grassland energy pyramid: 10,000 J → 1,000 J → 100 J → 10 J.",
      keyPoints: [
        "Three common pyramid types: numbers, biomass, energy.",
        "Energy pyramids are always upright.",
        "Each bar represents a trophic level.",
      ],
      visual: ["🔺 Energy", "🔺 Biomass", "🔺 Numbers"],
      quiz: {
        question: "Which ecological pyramid is always upright?",
        options: ["Pyramid of numbers", "Pyramid of biomass", "Pyramid of energy", "None of them"],
        answer: 2,
        why: "Energy decreases at every transfer, so the energy pyramid always tapers upward.",
      },
    },
    {
      slug: "trophic-cascade",
      title: "Trophic Cascade",
      tag: "Change",
      summary: "A chain of effects that follows a change in one species population.",
      explanation: [
        "Removing or adding a species can change populations at several trophic levels. Predators often have effects that ripple downward through the web.",
        "In this game, removing snakes releases frogs and rabbits, changes grasshopper and grass numbers, and slightly affects eagles.",
      ],
      example: "No snakes → more frogs → fewer grasshoppers → different grazing pressure on grass.",
      keyPoints: [
        "Effects can be direct or indirect.",
        "One removal can affect several levels.",
        "Food webs help predict these ripples.",
      ],
      visual: ["🐍 OFF", "🐸 ↑", "🦗 ↓", "🌿 ↓"],
      quiz: {
        question: "If snakes disappear, why might frogs increase?",
        options: ["Frogs start making their own food", "A predator is removed", "Grass disappears", "Eagles eat frogs"],
        answer: 1,
        why: "Snakes are frog predators, so removing snakes reduces frog mortality.",
      },
    },
    {
      slug: "nutrient-cycling",
      title: "Nutrient Cycling",
      tag: "Matter",
      summary: "The recycling of elements between organisms and the environment.",
      explanation: [
        "Nutrients such as carbon, nitrogen and phosphorus move between living things and the physical environment.",
        "Decomposers release nutrients from dead matter so producers can absorb them again. Unlike energy, matter is recycled.",
      ],
      example: "Fungi break down fallen leaves; minerals return to the soil; grass absorbs them.",
      keyPoints: [
        "Matter cycles; energy flows.",
        "Decomposers connect dead matter to producers.",
        "Nutrient cycles keep ecosystems productive.",
      ],
      visual: ["🍂", "🍄", "🪨", "🌿"],
      quiz: {
        question: "What do decomposers return to the environment?",
        options: ["Sunlight", "Heat only", "Recycled nutrients", "New producers"],
        answer: 2,
        why: "Decomposers release mineral nutrients from dead organic matter.",
      },
    },
  ];

  const TOPIC_BY_SLUG = Object.fromEntries(TOPICS.map((topic) => [topic.slug, topic]));

  const ECO_PEDIA = [
    { term: "Ecosystem", definition: "A community of organisms interacting with one another and with their non-living environment.", example: "A grassland with grass, insects, rabbits, snakes, eagles, fungi, soil and sunlight." },
    { term: "Habitat", definition: "The place where an organism lives and finds the resources it needs.", example: "The grassland is the habitat of the rabbit." },
    { term: "Food chain", definition: "A single sequence showing how energy passes from one organism to the next.", example: "Grass → Grasshopper → Frog → Snake." },
    { term: "Food web", definition: "A network of interconnected food chains in an ecosystem.", example: "Rabbits are eaten by both snakes and eagles." },
    { term: "Producer", definition: "An organism that makes its own food, usually by photosynthesis.", example: "Grass." },
    { term: "Consumer", definition: "An organism that obtains energy by eating other organisms.", example: "Grasshopper, rabbit, frog, snake, eagle." },
    { term: "Decomposer", definition: "An organism that breaks down dead organic matter and recycles nutrients.", example: "Fungi and bacteria." },
    { term: "Trophic level", definition: "The feeding position of an organism in a food chain, such as T1 or T2.", example: "Grass is T1; a grasshopper is T2." },
    { term: "Energy flow", definition: "The one-way movement of energy from producers to consumers.", example: "Sunlight → grass → grasshopper → frog." },
    { term: "10% Law", definition: "About 10% of the energy at one trophic level is transferred to the next; most is lost as heat, waste or uneaten material.", example: "10,000 J → 1,000 J → 100 J → 10 J." },
    { term: "Ecological pyramid", definition: "A diagram showing numbers, biomass or energy at each trophic level.", example: "A grassland energy pyramid with producers at the base." },
    { term: "Trophic cascade", definition: "A chain of indirect effects caused by adding or removing a species.", example: "Removing snakes can increase frogs and reduce grasshoppers." },
    { term: "Nutrient cycling", definition: "The recycling of elements between organisms and the environment.", example: "Decomposers return minerals to the soil for grass to absorb." },
    { term: "Apex consumer", definition: "A predator at the top of a food web with no predators in that web.", example: "The eagle in this grassland web." },
  ];

  const ENERGY_QUIZ = [
    {
      id: "q1",
      question: "Why does energy decrease at each trophic level?",
      options: [
        "Because organisms stop eating",
        "Because energy is used, lost as heat, and passed in waste",
        "Because producers create less sunlight",
        "Because decomposers remove all energy",
      ],
      answer: 1,
      why: "Respiration, heat loss, waste and uneaten parts mean only a fraction moves upward.",
    },
    {
      id: "q2",
      question: "If producers contain 10,000 J, how much is available to secondary consumers under the 10% law?",
      options: ["1,000 J", "100 J", "10 J", "9,000 J"],
      answer: 1,
      why: "10,000 → 1,000 (primary) → 100 J (secondary).",
    },
    {
      id: "q3",
      question: "Why is energy flow unidirectional?",
      options: [
        "Because consumers never eat producers",
        "Because heat released during transfer cannot be reused",
        "Because decomposers store all the energy",
        "Because energy pyramids are inverted",
      ],
      answer: 1,
      why: "Heat loss makes energy unavailable to the food web again, so flow is one-way.",
    },
  ];

  const BADGES = [
    { id: "food-web-builder", name: "Food Web Builder", emoji: "🕸️", description: "Completed Mission 1." },
    { id: "ecosystem-protector", name: "Ecosystem Protector", emoji: "🛡️", description: "Completed Mission 2." },
    { id: "energy-expert", name: "Energy Expert", emoji: "⚡", description: "Scored at least 2/3 in Mission 3." },
    { id: "ecosystem-guardian", name: "Ecosystem Guardian", emoji: "🏆", description: "Completed all three missions." },
    { id: "perfect-score", name: "Perfect Score", emoji: "💯", description: "Scored the maximum 130 points." },
    { id: "nature-saver", name: "Nature Saver", emoji: "🌱", description: "Restored the ecosystem to 100% health." },
  ];

  const MISSION_META = {
    web: { name: "Build the Food Web", maxScore: 70 },
    emergency: { name: "Ecosystem Emergency", maxScore: 30 },
    energy: { name: "Energy Master", maxScore: 30 },
  };

  const DIFFICULTY = {
    guided: { label: "Guided", hints: Infinity, description: "Unlimited hints and gentle feedback." },
    standard: { label: "Standard", hints: 3, description: "Three hints per Mission 1 attempt." },
    expert: { label: "Expert", hints: 0, description: "No hints. You are on your own." },
  };

  const DEFAULT_SETTINGS = {
    audio: true,
    music: false,
    difficulty: "standard",
    reducedMotion: false,
    largeText: false,
    highContrast: false,
    language: "English",
  };

  return {
    ORGANISMS,
    ORGANISM_BY_ID,
    EDGES,
    EDGE_PAIRS,
    EXTRA_ORGANISMS,
    EXTRA_CHAINS,
    CASCADE,
    CASCADE_BY_ID,
    EMERGENCY_OPTIONS,
    EMERGENCY_CORRECT,
    TOPICS,
    TOPIC_BY_SLUG,
    ECO_PEDIA,
    ENERGY_QUIZ,
    BADGES,
    MISSION_META,
    DIFFICULTY,
    DEFAULT_SETTINGS,
  };
})();
