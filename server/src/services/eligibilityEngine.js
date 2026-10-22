/**
 * AI-based eligibility & ranking engine.
 * Uses weighted rule matching + relevance scoring to recommend schemes.
 */

const WEIGHTS = {
  age: 15,
  gender: 10,
  category: 15,
  income: 20,
  occupation: 15,
  education: 8,
  state: 5,
  areaType: 5,
  maritalStatus: 5,
  disability: 12,
  bpl: 10,
  bankAccount: 3,
  aadhaar: 3,
};

const CATEGORY_BOOST = {
  education: { student: 8, unemployed: 3 },
  employment: { unemployed: 10, student: 4, 'self-employed': 5 },
  agriculture: { farmer: 12 },
  women: { female: 10 },
  'senior-citizen': {},
  health: {},
  housing: { rural: 4, urban: 4 },
  financial: { unemployed: 5, 'self-employed': 4 },
  'social-welfare': { sc: 4, st: 4, bpl: 6 },
  'skill-development': { student: 6, unemployed: 8 },
};

function checkListCriterion(allowed, value) {
  if (!allowed || allowed.length === 0) {
    return { applicable: false, matched: true };
  }
  if (!value) {
    return { applicable: true, matched: false, reason: 'Profile value missing' };
  }
  const matched = allowed.map((v) => v.toLowerCase()).includes(String(value).toLowerCase());
  return {
    applicable: true,
    matched,
    reason: matched ? `Matches allowed values` : `Does not match required values (${allowed.join(', ')})`,
  };
}

function evaluateScheme(profile, scheme) {
  const e = scheme.eligibility || {};
  const checks = [];
  let earned = 0;
  let possible = 0;
  const failedHard = [];
  const matchedReasons = [];
  const gapReasons = [];

  // Age
  if (e.minAge != null || e.maxAge != null) {
    possible += WEIGHTS.age;
    const age = profile.age;
    if (age == null) {
      gapReasons.push('Age not provided in profile');
    } else {
      const minOk = e.minAge == null || age >= e.minAge;
      const maxOk = e.maxAge == null || age <= e.maxAge;
      if (minOk && maxOk) {
        earned += WEIGHTS.age;
        matchedReasons.push(`Age ${age} is within required range`);
        checks.push({ field: 'age', matched: true, weight: WEIGHTS.age });
      } else {
        failedHard.push(
          `Age must be between ${e.minAge ?? 0} and ${e.maxAge ?? '∞'} (your age: ${age})`
        );
        checks.push({ field: 'age', matched: false, weight: WEIGHTS.age });
      }
    }
  }

  // Gender
  if (e.genders && e.genders.length) {
    possible += WEIGHTS.gender;
    const result = checkListCriterion(e.genders, profile.gender);
    if (result.matched) {
      earned += WEIGHTS.gender;
      matchedReasons.push(`Gender (${profile.gender}) is eligible`);
    } else if (profile.gender) {
      failedHard.push(`Gender must be one of: ${e.genders.join(', ')}`);
    } else {
      gapReasons.push('Gender not provided');
    }
    checks.push({ field: 'gender', matched: result.matched, weight: WEIGHTS.gender });
  }

  // Category
  if (e.categories && e.categories.length) {
    possible += WEIGHTS.category;
    const result = checkListCriterion(e.categories, profile.category);
    if (result.matched) {
      earned += WEIGHTS.category;
      matchedReasons.push(`Category (${profile.category}) is eligible`);
    } else if (profile.category) {
      failedHard.push(`Category must be one of: ${e.categories.join(', ')}`);
    } else {
      gapReasons.push('Social category not provided');
    }
    checks.push({ field: 'category', matched: result.matched, weight: WEIGHTS.category });
  }

  // Income
  if (e.maxAnnualIncome != null) {
    possible += WEIGHTS.income;
    if (profile.annualIncome == null) {
      gapReasons.push('Annual income not provided');
    } else if (profile.annualIncome <= e.maxAnnualIncome) {
      earned += WEIGHTS.income;
      matchedReasons.push(
        `Income ₹${profile.annualIncome.toLocaleString('en-IN')} is within limit ₹${e.maxAnnualIncome.toLocaleString('en-IN')}`
      );
      checks.push({ field: 'income', matched: true, weight: WEIGHTS.income });
    } else {
      failedHard.push(
        `Annual income must be ≤ ₹${e.maxAnnualIncome.toLocaleString('en-IN')} (yours: ₹${profile.annualIncome.toLocaleString('en-IN')})`
      );
      checks.push({ field: 'income', matched: false, weight: WEIGHTS.income });
    }
  }

  // Occupation
  if (e.occupations && e.occupations.length) {
    possible += WEIGHTS.occupation;
    const result = checkListCriterion(e.occupations, profile.occupation);
    if (result.matched) {
      earned += WEIGHTS.occupation;
      matchedReasons.push(`Occupation (${profile.occupation}) matches`);
    } else if (profile.occupation) {
      failedHard.push(`Occupation must be one of: ${e.occupations.join(', ')}`);
    } else {
      gapReasons.push('Occupation not provided');
    }
    checks.push({ field: 'occupation', matched: result.matched, weight: WEIGHTS.occupation });
  }

  // Education
  if (e.educationLevels && e.educationLevels.length) {
    possible += WEIGHTS.education;
    const result = checkListCriterion(e.educationLevels, profile.education);
    if (result.matched) {
      earned += WEIGHTS.education;
      matchedReasons.push(`Education level matches`);
    } else if (profile.education) {
      failedHard.push(`Education must be one of: ${e.educationLevels.join(', ')}`);
    } else {
      gapReasons.push('Education not provided');
    }
    checks.push({ field: 'education', matched: result.matched, weight: WEIGHTS.education });
  }

  // State
  if (e.states && e.states.length) {
    possible += WEIGHTS.state;
    const result = checkListCriterion(e.states, profile.state);
    if (result.matched) {
      earned += WEIGHTS.state;
      matchedReasons.push(`State (${profile.state}) is covered`);
    } else if (profile.state) {
      failedHard.push(`Scheme limited to: ${e.states.join(', ')}`);
    } else {
      gapReasons.push('State not provided');
    }
    checks.push({ field: 'state', matched: result.matched, weight: WEIGHTS.state });
  }

  // Area type
  if (e.areaTypes && e.areaTypes.length) {
    possible += WEIGHTS.areaType;
    const result = checkListCriterion(e.areaTypes, profile.areaType);
    if (result.matched) {
      earned += WEIGHTS.areaType;
      matchedReasons.push(`Area type (${profile.areaType}) matches`);
    } else if (profile.areaType) {
      failedHard.push(`Area must be: ${e.areaTypes.join(', ')}`);
    } else {
      gapReasons.push('Area type not provided');
    }
    checks.push({ field: 'areaType', matched: result.matched, weight: WEIGHTS.areaType });
  }

  // Marital status
  if (e.maritalStatuses && e.maritalStatuses.length) {
    possible += WEIGHTS.maritalStatus;
    const result = checkListCriterion(e.maritalStatuses, profile.maritalStatus);
    if (result.matched) {
      earned += WEIGHTS.maritalStatus;
      matchedReasons.push(`Marital status matches`);
    } else if (profile.maritalStatus) {
      failedHard.push(`Marital status must be: ${e.maritalStatuses.join(', ')}`);
    } else {
      gapReasons.push('Marital status not provided');
    }
    checks.push({
      field: 'maritalStatus',
      matched: result.matched,
      weight: WEIGHTS.maritalStatus,
    });
  }

  // Disability
  if (e.requiresDisability) {
    possible += WEIGHTS.disability;
    if (profile.disability) {
      earned += WEIGHTS.disability;
      matchedReasons.push('Disability status matches scheme requirement');
      checks.push({ field: 'disability', matched: true, weight: WEIGHTS.disability });
    } else {
      failedHard.push('Scheme requires a person with disability');
      checks.push({ field: 'disability', matched: false, weight: WEIGHTS.disability });
    }
  }

  // BPL
  if (e.requiresBPL) {
    possible += WEIGHTS.bpl;
    if (profile.isBPL) {
      earned += WEIGHTS.bpl;
      matchedReasons.push('BPL status matches');
      checks.push({ field: 'bpl', matched: true, weight: WEIGHTS.bpl });
    } else {
      failedHard.push('Scheme requires BPL card holder');
      checks.push({ field: 'bpl', matched: false, weight: WEIGHTS.bpl });
    }
  }

  // Bank account
  if (e.requiresBankAccount) {
    possible += WEIGHTS.bankAccount;
    if (profile.hasBankAccount) {
      earned += WEIGHTS.bankAccount;
      matchedReasons.push('Bank account available');
    } else {
      failedHard.push('Active bank account required');
    }
    checks.push({
      field: 'bankAccount',
      matched: !!profile.hasBankAccount,
      weight: WEIGHTS.bankAccount,
    });
  }

  // Aadhaar
  if (e.requiresAadhaar) {
    possible += WEIGHTS.aadhaar;
    if (profile.aadhaarLinked) {
      earned += WEIGHTS.aadhaar;
      matchedReasons.push('Aadhaar linked');
    } else {
      failedHard.push('Aadhaar linkage required');
    }
    checks.push({
      field: 'aadhaar',
      matched: !!profile.aadhaarLinked,
      weight: WEIGHTS.aadhaar,
    });
  }

  // Soft relevance boosts (AI-style personalization)
  let boost = 0;
  const boostMap = CATEGORY_BOOST[scheme.category] || {};
  if (profile.occupation && boostMap[profile.occupation]) {
    boost += boostMap[profile.occupation];
  }
  if (profile.gender === 'female' && scheme.category === 'women') {
    boost += 10;
  }
  if (profile.age >= 60 && scheme.category === 'senior-citizen') {
    boost += 12;
  }
  if (profile.isBPL && boostMap.bpl) {
    boost += boostMap.bpl;
  }
  if (profile.category && boostMap[profile.category]) {
    boost += boostMap[profile.category];
  }
  if (profile.areaType && boostMap[profile.areaType]) {
    boost += boostMap[profile.areaType];
  }

  const baseScore = possible > 0 ? (earned / possible) * 100 : 100;
  const matchScore = Math.min(100, Math.round(baseScore + boost * 0.4));
  const eligible = failedHard.length === 0 && possible > 0;

  let eligibilityStatus = 'not_eligible';
  if (eligible && matchScore >= 70) eligibilityStatus = 'highly_eligible';
  else if (eligible && matchScore >= 40) eligibilityStatus = 'eligible';
  else if (failedHard.length === 0 && gapReasons.length > 0) eligibilityStatus = 'incomplete_profile';
  else if (failedHard.length > 0 && earned > 0) eligibilityStatus = 'partially_eligible';

  return {
    schemeId: scheme._id,
    scheme,
    eligible,
    eligibilityStatus,
    matchScore,
    matchedCriteria: matchedReasons,
    failedCriteria: failedHard,
    missingInfo: gapReasons,
    checks,
    aiSummary: buildSummary(scheme, eligibilityStatus, matchScore, matchedReasons, failedHard),
  };
}

function buildSummary(scheme, status, score, matched, failed) {
  if (status === 'highly_eligible') {
    return `Strong match (${score}%). Your profile aligns well with ${scheme.shortName || scheme.name}. Key reasons: ${matched.slice(0, 3).join('; ')}.`;
  }
  if (status === 'eligible') {
    return `You appear eligible (${score}% relevance). ${matched.slice(0, 2).join('; ') || 'Most criteria satisfied'}.`;
  }
  if (status === 'partially_eligible') {
    return `Partial match (${score}%). Some criteria fit, but: ${failed.slice(0, 2).join('; ')}.`;
  }
  if (status === 'incomplete_profile') {
    return `Cannot fully verify eligibility — please complete missing profile details.`;
  }
  return `Currently not eligible. ${failed.slice(0, 2).join('; ') || 'Criteria not met'}.`;
}

function recommendSchemes(profile, schemes, options = {}) {
  const { includeIneligible = false, limit = 20 } = options;

  const evaluated = schemes
    .filter((s) => s.isActive !== false)
    .map((scheme) => evaluateScheme(profile, scheme))
    .sort((a, b) => {
      const statusRank = {
        highly_eligible: 4,
        eligible: 3,
        incomplete_profile: 2,
        partially_eligible: 1,
        not_eligible: 0,
      };
      const rankDiff = (statusRank[b.eligibilityStatus] || 0) - (statusRank[a.eligibilityStatus] || 0);
      if (rankDiff !== 0) return rankDiff;
      return b.matchScore - a.matchScore;
    });

  const filtered = includeIneligible
    ? evaluated
    : evaluated.filter((r) =>
        ['highly_eligible', 'eligible', 'incomplete_profile', 'partially_eligible'].includes(
          r.eligibilityStatus
        )
      );

  return filtered.slice(0, limit).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

module.exports = {
  evaluateScheme,
  recommendSchemes,
  WEIGHTS,
};
