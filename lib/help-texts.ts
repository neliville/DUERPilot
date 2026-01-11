/**
 * Textes d'aide réutilisables pour les tooltips
 * Centralisés pour faciliter la maintenance et la cohérence
 */

export const helpTexts = {
  // Entreprise
  company: {
    legalName: "Nom officiel de l'entreprise tel qu'il apparaît dans les statuts et les documents légaux.",
    siret: "Numéro SIRET à 14 chiffres (Système d'Identification du Répertoire des Entreprises). Facultatif mais recommandé pour la conformité.",
    activity: "Description de l'activité principale exercée par l'entreprise (ex: Restauration, BTP, Commerce).",
    sector: "Secteur d'activité selon la nomenclature NAF (ex: 56.10Z - Restauration traditionnelle).",
    employeeCount: "Nombre total de salariés de l'entreprise. Utilisé pour déterminer les obligations réglementaires et les quotas.",
    phone: "Numéro de téléphone de contact principal de l'entreprise.",
    email: "Adresse email de contact principale. Utilisée pour les notifications et communications importantes.",
    website: "URL du site web de l'entreprise (optionnel).",
  },

  // Unités de travail
  workUnit: {
    name: "Nom de l'unité de travail (ex: Atelier de production, Bureau administratif). Une unité regroupe des postes de travail similaires.",
    description: "Description détaillée des activités réalisées dans cette unité. Cette information aide l'IA à suggérer des dangers pertinents.",
    exposedCount: "Nombre de personnes travaillant dans cette unité de travail. Important pour l'évaluation de l'exposition aux risques.",
    site: "Site ou établissement auquel appartient cette unité de travail. Un site peut contenir plusieurs unités.",
  },

  // Évaluations de risques
  riskAssessment: {
    workUnit: "Unité de travail dans laquelle le risque a été identifié. Chaque risque est évalué dans le contexte d'une unité spécifique.",
    hazard: "Danger identifié selon le référentiel INRS. Le danger est la propriété intrinsèque d'un équipement, d'une substance ou d'une situation.",
    dangerousSituation: "Description précise de la situation dangereuse : circonstances, conditions de travail, contexte. Cette description doit être claire et factuelle.",
    exposedPersons: "Description des personnes exposées au risque (ex: Opérateurs machine, Personnel de maintenance). Précisez le nombre si possible.",
    existingMeasures: "Mesures de prévention déjà en place pour réduire le risque (EPI, formations, procédures, équipements de protection).",
    frequency: "Fréquence d'exposition au danger : 1 = Rare (annuelle), 2 = Occasionnelle (mensuelle), 3 = Fréquente (hebdomadaire), 4 = Permanente (quotidienne).",
    probability: "Probabilité que l'accident se produise : 1 = Très faible, 2 = Faible, 3 = Probable, 4 = Très probable.",
    severity: "Gravité des conséquences en cas d'accident : 1 = Légère (soins simples), 2 = Modérée (arrêt de travail), 3 = Grave (incapacité permanente), 4 = Très grave (décès).",
    control: "Niveau de maîtrise du risque : 1 = Maîtrise totale, 2 = Maîtrise partielle, 3 = Maîtrise insuffisante, 4 = Absence de maîtrise.",
    riskScore: "Score de criticité calculé : F × P × G × M. Plus le score est élevé, plus le risque est prioritaire. Score ≥ 16 = Action immédiate requise.",
  },

  // Actions
  action: {
    type: "Type d'action : Technique (modification équipement), Organisationnelle (procédure, formation), Humaine (comportement, sensibilisation).",
    description: "Description détaillée de l'action de prévention à mettre en œuvre. Soyez précis et actionnable.",
    priority: "Priorité d'action : Basse (planification normale), Moyenne (sous 3 mois), Haute (sous 1 mois), Critique (immédiate).",
    responsible: "Personne responsable de la mise en œuvre de l'action. Peut être un nom ou un service.",
    dueDate: "Date limite de réalisation de l'action. Important pour le suivi et la planification.",
    status: "État d'avancement : À faire, En cours, Bloqué, Terminé. Mettez à jour régulièrement pour un suivi efficace.",
    proofUrl: "Lien vers un document, photo ou preuve de réalisation de l'action (optionnel). Utile pour la traçabilité.",
  },

  // Observations
  observation: {
    type: "Type d'observation : Situation dangereuse (risque identifié), Presqu'accident (incident sans blessure), Remontée terrain (signalement).",
    description: "Description factuelle et détaillée de l'observation. Incluez le contexte, les circonstances et les personnes concernées.",
    location: "Lieu précis de l'observation (unité de travail, zone, équipement).",
    date: "Date et heure de l'observation. Important pour la traçabilité et l'analyse des tendances.",
    severity: "Gravité perçue de la situation observée. Utilisée pour prioriser les actions correctives.",
  },

  // Dashboard
  dashboard: {
    completionRate: "Pourcentage de complétion de votre DUERP. Basé sur les 5 étapes clés : Entreprise, Unités, Évaluations, Actions, DUERP généré.",
    activeRisks: "Nombre total de risques identifiés et évalués dans votre entreprise. Inclut tous les risques actifs non maîtrisés.",
    pendingActions: "Nombre d'actions de prévention en cours ou à faire. Actions prioritaires nécessitant un suivi.",
    lastDuerp: "Date de la dernière génération de votre DUERP. Le DUERP doit être mis à jour annuellement minimum.",
  },

  // Admin Dashboard
  admin: {
    mrr: "Monthly Recurring Revenue : Revenus récurrents mensuels générés par tous les abonnements actifs. Indicateur clé de la santé financière.",
    arr: "Annual Recurring Revenue : Revenus récurrents annuels (MRR × 12). Projection des revenus sur une année.",
    netMargin: "Marge nette après déduction des coûts d'infrastructure et d'IA. Indicateur de rentabilité réelle du SaaS.",
    aiCost: "Coût total de l'utilisation de l'IA (OpenAI, Anthropic) pour tous les clients. Impact direct sur la marge.",
    conversionRate: "Taux de conversion du plan Free vers Starter. Indicateur de l'efficacité du produit et du pricing.",
    activeClients: "Nombre total de clients actifs (non suspendus, non résiliés) par plan tarifaire.",
    churnRate: "Taux de désabonnement mensuel. Calculé comme le nombre de résiliations sur le nombre total de clients.",
  },

  // Import
  import: {
    fileType: "Formats supportés : PDF (natif ou scanné avec OCR), Word (.docx), Excel (.xlsx), CSV. Taille max selon votre plan.",
    extractionLevel: "Niveau d'extraction IA : Basique (75-85% précision), Avancée (85-92%), Complète (92-97%). Plus le niveau est élevé, plus l'extraction est précise.",
    validation: "Après l'import, vérifiez et validez les données extraites. L'IA est assistive, vous restez responsable de la conformité finale.",
  },
} as const;

