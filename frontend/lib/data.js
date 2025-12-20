
export const CCM_CODES = [
  {
    id: '99490',
    code: '99490',
    description: 'Chronic care management services, at least 20 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.',
    timeRequirement: '20 minutes',
    complexity: 'Basic',
    requirements: [
      'Multiple (two or more) chronic conditions expected to last at least 12 months, or until the death of the patient',
      'Chronic conditions place the patient at significant risk of death, acute exacerbation/decompensation, or functional decline',
      'Comprehensive care plan established, implemented, revised, or monitored',
      'At least 20 minutes of clinical staff time per calendar month'
    ]
  },
  {
    id: '99439',
    code: '99439',
    description: 'Each additional 20 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.',
    timeRequirement: '+20 minutes',
    complexity: 'Add-on',
    requirements: [
      'Must be billed in conjunction with 99490',
      'At least 20 additional minutes of clinical staff time'
    ]
  },
  {
    id: '99491',
    code: '99491',
    description: 'Chronic care management services, provided personally by a physician or other qualified health care professional, at least 30 minutes of physician or other qualified health care professional time, per calendar month.',
    timeRequirement: '30 minutes (Physician)',
    complexity: 'Physician-Driven',
    requirements: [
      'Provided personally by a physician or other qualified health care professional',
      'At least 30 minutes of time per calendar month',
      'Multiple (two or more) chronic conditions',
      'Comprehensive care plan established, implemented, revised, or monitored'
    ]
  },
  {
    id: '99437',
    code: '99437',
    description: 'Each additional 30 minutes by a physician or other qualified health care professional, per calendar month.',
    timeRequirement: '+30 minutes (Physician)',
    complexity: 'Add-on',
    requirements: [
      'Must be billed in conjunction with 99491',
      'At least 30 additional minutes of physician time'
    ]
  },
  {
    id: '99487',
    code: '99487',
    description: 'Complex chronic care management services, with the following required elements: multiple (two or more) chronic conditions expected to last at least 12 months, or until the death of the patient, chronic conditions place the patient at significant risk of death, acute exacerbation/decompensation, or functional decline, establishment or substantial revision of a comprehensive care plan, moderate or high complexity medical decision making; 60 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.',
    timeRequirement: '60 minutes',
    complexity: 'Complex',
    requirements: [
      'Multiple (two or more) chronic conditions',
      'Moderate or high complexity medical decision making',
      'Establishment or substantial revision of a comprehensive care plan',
      'At least 60 minutes of clinical staff time'
    ]
  },
  {
    id: '99489',
    code: '99489',
    description: 'Each additional 30 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.',
    timeRequirement: '+30 minutes',
    complexity: 'Complex Add-on',
    requirements: [
      'Must be billed in conjunction with 99487',
      'At least 30 additional minutes of clinical staff time'
    ]
  }
];

export const MOCK_AUDIT_HISTORY = [
  {
    id: '1',
    date: '2023-10-15T10:30:00Z',
    codeId: '99490',
    riskLevel: 'Low',
    riskScore: 95,
    clinicalConditions: ['Hypertension', 'Type 2 Diabetes'],
    missingRequirements: []
  },
  {
    id: '2',
    date: '2023-10-14T14:20:00Z',
    codeId: '99487',
    riskLevel: 'High',
    riskScore: 45,
    clinicalConditions: ['COPD', 'Heart Failure'],
    missingRequirements: ['Moderate or high complexity medical decision making', 'Establishment or substantial revision of a comprehensive care plan']
  },
  {
    id: '3',
    date: '2023-10-12T09:15:00Z',
    codeId: '99491',
    riskLevel: 'Medium',
    riskScore: 70,
    clinicalConditions: ['Arthritis', 'Osteoporosis'],
    missingRequirements: ['At least 30 minutes of time per calendar month']
  }
];

export const analyzeNote = async (text, codeId) => {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const code = CCM_CODES.find(c => c.id === codeId);
  if (!code) throw new Error('Invalid code');

  // Strip PHI from text (basic simulation - in production use proper PHI detection)
  const strippedText = text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REDACTED]')
    .replace(/\b\d{10}\b/g, '[PHONE REDACTED]')
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[PATIENT NAME]')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[DATE]');

  // Mock analysis logic based on random factors or simple keyword checks if we had real text
  // For demo purposes, we'll generate a semi-random result
  const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100
  
  let riskLevel = 'Low';
  if (randomScore < 70) riskLevel = 'High';
  else if (randomScore < 90) riskLevel = 'Medium';

  const missing = [];
  const met = [];

  code.requirements.forEach((req, index) => {
    // Randomly assign met/missing based on score
    if (Math.random() > (randomScore / 100)) {
      missing.push({
        requirement: req,
        explanation: `The documentation does not clearly state "${req}". This is a critical element for billing code ${code.code}.`,
        suggestion: `Add a specific statement regarding "${req}" to the assessment and plan section.`
      });
    } else {
      met.push(req);
    }
  });

  // Ensure at least one missing if score is low/medium
  if (riskLevel !== 'Low' && missing.length === 0) {
     missing.push({
        requirement: code.requirements[0],
        explanation: `The documentation does not clearly state "${code.requirements[0]}".`,
        suggestion: `Add a specific statement regarding "${code.requirements[0]}".`
      });
      // Remove from met
      const index = met.indexOf(code.requirements[0]);
      if (index > -1) met.splice(index, 1);
  }

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    codeId,
    riskLevel,
    riskScore: randomScore,
    missingRequirements: missing,
    metRequirements: met,
    clinicalConditions: ['Hypertension', 'Hyperlipidemia'], // Mock extracted conditions
    noteText: strippedText // Include PHI-stripped note text
  };
};
