import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed les situations dangereuses types par catégorie et secteur suggéré
 * Conforme au référentiel DUERP propriétaire
 */
export async function seedDangerousSituations() {
  console.log('🌱 Seeding dangerous situations...');

  // Récupérer les catégories et secteurs
  const categories = await prisma.dangerCategory.findMany();
  const sectors = await prisma.activitySector.findMany();

  const categoryMap = new Map(categories.map(c => [c.code, c]));
  const sectorMap = new Map(sectors.map(s => [s.code, s]));

  // Situations dangereuses par catégorie
  const situations = [
    // Physiques (PHY)
    {
      categoryCode: 'PHY',
      code: 'PHY_001_BRUIT',
      label: 'Exposition au bruit',
      description: 'Exposition sonore dépassant les valeurs limites réglementaires',
      examples: 'Machines bruyantes, chantier, outils de découpe',
      keywords: ['bruit', 'sonore', 'décibel', 'surdité'],
      suggestedSector: 'BTP',
      mandatory: false,
    },
    {
      categoryCode: 'PHY',
      code: 'PHY_002_VIBRATIONS',
      label: 'Exposition aux vibrations',
      description: 'Vibrations transmises au corps entier ou aux membres',
      examples: 'Engins de chantier, outils portatifs, machines industrielles',
      keywords: ['vibrations', 'membres', 'corps', 'engins'],
      suggestedSector: 'BTP',
      mandatory: false,
    },
    {
      categoryCode: 'PHY',
      code: 'PHY_003_TEMP',
      label: 'Exposition aux températures extrêmes',
      description: 'Chaleur ou froid pouvant affecter la santé',
      examples: 'Chantier extérieur, chambres froides, fours, postes en extérieur',
      keywords: ['chaleur', 'froid', 'température', 'intempéries'],
      suggestedSector: null, // Commun à plusieurs secteurs
      mandatory: false,
    },
    {
      categoryCode: 'PHY',
      code: 'PHY_004_RAYONNEMENTS',
      label: 'Exposition aux rayonnements',
      description: 'Rayonnements ionisants ou non ionisants',
      examples: 'Rayons X (santé), UV (soudage), lasers',
      keywords: ['rayonnement', 'UV', 'X', 'laser'],
      suggestedSector: 'SANTE',
      mandatory: false,
    },
    {
      categoryCode: 'PHY',
      code: 'PHY_005_ECLAIRAGE',
      label: 'Éclairage insuffisant ou inadapté',
      description: 'Manque ou défaut d\'éclairage pouvant causer fatigue visuelle ou accidents',
      examples: 'Postes de travail mal éclairés, éclairage d\'ambiance insuffisant',
      keywords: ['éclairage', 'luminosité', 'visuel', 'fatigue'],
      suggestedSector: 'BUREAU',
      mandatory: false,
    },

    // Chimiques (CHI)
    {
      categoryCode: 'CHI',
      code: 'CHI_001_PRODUITS',
      label: 'Contact avec produits chimiques',
      description: 'Exposition à des substances chimiques dangereuses',
      examples: 'Solvants, produits d\'entretien, peintures, colles',
      keywords: ['chimique', 'solvant', 'produit', 'substance'],
      suggestedSector: 'INDUSTRIE',
      mandatory: false,
    },
    {
      categoryCode: 'CHI',
      code: 'CHI_002_FUMÉES',
      label: 'Inhalation de fumées ou poussières',
      description: 'Exposition respiratoire à des agents chimiques ou particules',
      examples: 'Fumées de soudage, poussières de bois, farine, particules fines',
      keywords: ['inhalation', 'fumée', 'poussière', 'respiratoire'],
      suggestedSector: 'BTP',
      mandatory: false,
    },
    {
      categoryCode: 'CHI',
      code: 'CHI_003_GAZ',
      label: 'Exposition aux gaz',
      description: 'Contact avec des gaz toxiques, asphyxiants ou inflammables',
      examples: 'Monoxyde de carbone, gaz de combustion, gaz comprimés',
      keywords: ['gaz', 'toxique', 'asphyxie', 'inflammable'],
      suggestedSector: 'INDUSTRIE',
      mandatory: false,
    },

    // Biologiques (BIO)
    {
      categoryCode: 'BIO',
      code: 'BIO_001_AGENTS',
      label: 'Contact avec agents biologiques',
      description: 'Exposition à des micro-organismes pathogènes',
      examples: 'Virus, bactéries, champignons, parasites',
      keywords: ['biologique', 'micro-organisme', 'pathogène', 'infection'],
      suggestedSector: 'SANTE',
      mandatory: false,
    },
    {
      categoryCode: 'BIO',
      code: 'BIO_002_ANIMAUX',
      label: 'Contact avec animaux ou produits d\'origine animale',
      description: 'Exposition à des agents biologiques via animaux ou leurs produits',
      examples: 'Élevage, abattoir, transformation de viande, soins vétérinaires',
      keywords: ['animal', 'viande', 'élevage', 'vétérinaire'],
      suggestedSector: 'AGRICULTURE',
      mandatory: false,
    },
    {
      categoryCode: 'BIO',
      code: 'BIO_003_MOISISSURES',
      label: 'Exposition aux moisissures et allergènes',
      description: 'Contact avec des agents biologiques allergisants',
      examples: 'Moisissures, pollens, acariens, latex',
      keywords: ['moisissure', 'allergène', 'pollen', 'acarien'],
      suggestedSector: 'SANTE',
      mandatory: false,
    },

    // Ergonomiques (ERG)
    {
      categoryCode: 'ERG',
      code: 'ERG_001_GESTES',
      label: 'Gestes répétitifs et mouvements forcés',
      description: 'Travail répétitif pouvant causer troubles musculo-squelettiques',
      examples: 'Assemblage, saisie informatique, manutention répétée',
      keywords: ['répétitif', 'geste', 'TMS', 'mouvement'],
      suggestedSector: 'INDUSTRIE',
      mandatory: false,
    },
    {
      categoryCode: 'ERG',
      code: 'ERG_002_PORT_CHARGES',
      label: 'Manutention manuelle de charges',
      description: 'Port, levage, poussage ou traction de charges lourdes',
      examples: 'Chargement, déchargement, déménagement, entreposage',
      keywords: ['manutention', 'charge', 'port', 'levage'],
      suggestedSector: 'LOGISTIQUE',
      mandatory: false,
    },
    {
      categoryCode: 'ERG',
      code: 'ERG_003_POSTURE',
      label: 'Postures pénibles ou contraintes',
      description: 'Positions de travail statiques ou contraignantes',
      examples: 'Travail accroupi, bras levés, torsion du dos, position debout prolongée',
      keywords: ['posture', 'statique', 'contrainte', 'position'],
      suggestedSector: null, // Commun à plusieurs secteurs
      mandatory: false,
    },
    {
      categoryCode: 'ERG',
      code: 'ERG_004_ECRAN',
      label: 'Travail sur écran',
      description: 'Utilisation prolongée d\'écrans pouvant causer fatigue visuelle',
      examples: 'Ordinateur, tablette, smartphone, poste de travail informatique',
      keywords: ['écran', 'informatique', 'visuel', 'ordinateur'],
      suggestedSector: 'BUREAU',
      mandatory: false,
    },

    // Psychosociaux (PSY)
    {
      categoryCode: 'PSY',
      code: 'PSY_001_CHARGE',
      label: 'Charge de travail excessive',
      description: 'Quantité ou complexité de travail dépassant les capacités',
      examples: 'Surcharge cognitive, délais serrés, objectifs inatteignables',
      keywords: ['charge', 'travail', 'surcharge', 'délai'],
      suggestedSector: null, // Commun à plusieurs secteurs
      mandatory: false,
    },
    {
      categoryCode: 'PSY',
      code: 'PSY_002_STRESS',
      label: 'Stress et pression psychologique',
      description: 'Contraintes psychologiques pouvant affecter la santé mentale',
      examples: 'Urgence, pression hiérarchique, conflits, exigences contradictoires',
      keywords: ['stress', 'pression', 'psychologique', 'conflit'],
      suggestedSector: null, // Commun à plusieurs secteurs
      mandatory: false,
    },
    {
      categoryCode: 'PSY',
      code: 'PSY_003_HARCELEMENT',
      label: 'Harcèlement moral ou sexuel',
      description: 'Comportements répétés pouvant porter atteinte à la dignité',
      examples: 'Harcèlement moral, sexuel, discriminations',
      keywords: ['harcèlement', 'moral', 'sexuel', 'discrimination'],
      suggestedSector: null, // Commun à plusieurs secteurs
      mandatory: true, // Obligatoire réglementairement
    },
    {
      categoryCode: 'PSY',
      code: 'PSY_004_ISOLEMENT',
      label: 'Isolement et manque de soutien social',
      description: 'Travail isolé ou absence de soutien de la hiérarchie et des collègues',
      examples: 'Télétravail isolé, travailleur isolé, absence de reconnaissance',
      keywords: ['isolement', 'soutien', 'social', 'reconnaissance'],
      suggestedSector: 'BUREAU',
      mandatory: false,
    },

    // Mécaniques (MEC)
    {
      categoryCode: 'MEC',
      code: 'MEC_001_MACHINES',
      label: 'Contact avec machines et équipements',
      description: 'Risque de coupure, écrasement, happement par machines',
      examples: 'Scies, presses, robots, engins de chantier',
      keywords: ['machine', 'équipement', 'coupure', 'écrasement'],
      suggestedSector: 'INDUSTRIE',
      mandatory: false,
    },
    {
      categoryCode: 'MEC',
      code: 'MEC_002_OUTILS',
      label: 'Utilisation d\'outils tranchants ou coupants',
      description: 'Risques de coupures avec outils manuels ou portatifs',
      examples: 'Couteaux, ciseaux, cutters, outils de découpe',
      keywords: ['outil', 'tranchant', 'coupant', 'coupure'],
      suggestedSector: 'RESTO',
      mandatory: false,
    },
    {
      categoryCode: 'MEC',
      code: 'MEC_003_CHUTE_OBJETS',
      label: 'Chute d\'objets',
      description: 'Objets tombant de hauteur pouvant blesser',
      examples: 'Matériaux, outillage, équipements, marchandises',
      keywords: ['chute', 'objet', 'hauteur', 'matériau'],
      suggestedSector: 'BTP',
      mandatory: false,
    },

    // Électriques (ELEC)
    {
      categoryCode: 'ELEC',
      code: 'ELEC_001_CONTACT',
      label: 'Contact avec courant électrique',
      description: 'Risque d\'électrocution ou d\'électrisation',
      examples: 'Installations électriques, équipements défectueux, travaux électriques',
      keywords: ['électrique', 'électrocution', 'contact', 'courant'],
      suggestedSector: 'BTP',
      mandatory: false,
    },
    {
      categoryCode: 'ELEC',
      code: 'ELEC_002_ARC',
      label: 'Arc électrique et court-circuit',
      description: 'Risques liés aux arcs électriques et courts-circuits',
      examples: 'Interventions électriques, équipements sous tension, surcharge',
      keywords: ['arc', 'court-circuit', 'surcharge', 'tension'],
      suggestedSector: 'INDUSTRIE',
      mandatory: false,
    },

    // Incendie (INC)
    {
      categoryCode: 'INC',
      code: 'INC_001_FEU',
      label: 'Démarrage et propagation d\'incendie',
      description: 'Risque d\'incendie pouvant menacer personnes et biens',
      examples: 'Sources de chaleur, matériaux inflammables, installations électriques défectueuses',
      keywords: ['incendie', 'feu', 'inflammable', 'combustion'],
      suggestedSector: null, // Commun à plusieurs secteurs
      mandatory: false,
    },
    {
      categoryCode: 'INC',
      code: 'INC_002_EXPLOSION',
      label: 'Explosion et déflagration',
      description: 'Risque d\'explosion de gaz, poussières ou produits',
      examples: 'Gaz comprimés, poussières combustibles, produits explosifs',
      keywords: ['explosion', 'déflagration', 'gaz', 'poussière'],
      suggestedSector: 'INDUSTRIE',
      mandatory: false,
    },

    // Organisationnels (ORG)
    {
      categoryCode: 'ORG',
      code: 'ORG_001_ORGANISATION',
      label: 'Organisation du travail défaillante',
      description: 'Défaut d\'organisation pouvant favoriser accidents ou troubles',
      examples: 'Méthodes de travail floues, manque de formation, procédures insuffisantes',
      keywords: ['organisation', 'méthode', 'formation', 'procédure'],
      suggestedSector: null, // Commun à plusieurs secteurs
      mandatory: false,
    },
    {
      categoryCode: 'ORG',
      code: 'ORG_002_HORAIRES',
      label: 'Horaires de travail contraignants',
      description: 'Travail de nuit, posté, prolongé pouvant affecter la santé',
      examples: 'Travail de nuit, horaires décalés, heures supplémentaires',
      keywords: ['horaire', 'nuit', 'posté', 'contrainte'],
      suggestedSector: 'RESTO',
      mandatory: false,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const situation of situations) {
    const category = categoryMap.get(situation.categoryCode);
    if (!category) {
      console.warn(`⚠️  Category ${situation.categoryCode} not found, skipping situation ${situation.code}`);
      skipped++;
      continue;
    }

    // Vérifier si le secteur suggéré existe (si fourni)
    const suggestedSectorCode = situation.suggestedSector 
      ? (sectorMap.get(situation.suggestedSector)?.code || null)
      : null;

    try {
      await prisma.dangerousSituation.upsert({
        where: { code: situation.code },
        update: {
          label: situation.label,
          description: situation.description,
          examples: situation.examples || null,
          keywords: situation.keywords || [],
          suggestedSector: suggestedSectorCode,
          mandatory: situation.mandatory,
        },
        create: {
          categoryId: category.id,
          code: situation.code,
          label: situation.label,
          description: situation.description || null,
          examples: situation.examples || null,
          keywords: situation.keywords || [],
          suggestedSector: suggestedSectorCode,
          mandatory: situation.mandatory || false,
          isCustom: false,
          tenantId: null, // Situations globales
        },
      });
      created++;
    } catch (error) {
      console.error(`❌ Error seeding situation ${situation.code}:`, error);
      skipped++;
    }
  }

  console.log(`✅ Seeded ${created} dangerous situations (${skipped} skipped)`);
}

