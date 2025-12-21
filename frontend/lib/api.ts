// API configuration and functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface Audit {
  _id: string;
  providerId: string;
  organizationId: string;
  ccmCode: string;
  clinicalNoteText: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  missingRequirements: Array<{
    requirement: string;
    explanation: string;
    suggestion: string;
  }>;
  metRequirements: string[];
  clinicalConditions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CCMCode {
  id: string;
  code: string;
  description: string;
  timeRequirement: string;
  complexity: string;
  requirements: string[];
}

export interface ClinicalNoteUploadResponse {
  noteId: string;
  fileName: string;
  extractedText: string;
}

export interface AnalyzeAuditRequest {
  noteText: string;
  codeId: string;
  noteId?: string;
}

export interface AnalyzeAuditResponse {
  audit: {
    id: string;
    riskLevel: string;
    riskScore: number;
    missingRequirements: Array<{
      requirement: string;
      explanation: string;
      suggestion: string;
    }>;
    metRequirements: string[];
    clinicalConditions: string[];
    createdAt: string;
  };
  quotaUsed: number;
  quotaLimit: number;
}

export interface ProviderStats {
  _id: string;
  name: string;
  email: string;
  totalAudits: number;
  averageRiskScore: number;
  lastAuditDate: string;
}

// API functions
export async function fetchAudits(): Promise<Audit[]> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/audits`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch audits');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching audits:', error);
    return [];
  }
}

export async function fetchOrganizationQuota(): Promise<{ used: number; limit: number }> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/quota`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quota');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching quota:', error);
    return { used: 0, limit: 100 };
  }
}

export async function fetchProviders(): Promise<ProviderStats[]> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/management/providers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch providers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching providers:', error);
    return [];
  }
}

export async function fetchCCMCodes(): Promise<CCMCode[]> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/ccm-codes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CCM codes');
    }
    
    const data = await response.json();
    
    // Transform the backend response to match frontend expectations
    return data.map((code: any) => ({
      id: code._id || code.id,
      code: code.code,
      description: code.description,
      timeRequirement: code.timeRequirement,
      complexity: code.complexity,
      requirements: code.requirements
    }));
  } catch (error) {
    console.error('Error fetching CCM codes:', error);
    return [];
  }
}

export async function uploadClinicalNote(file: File): Promise<ClinicalNoteUploadResponse> {
  try {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/v1/notes/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to upload clinical note');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading clinical note:', error);
    throw error;
  }
}

export async function analyzeAudit(request: AnalyzeAuditRequest): Promise<AnalyzeAuditResponse> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/audits/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to analyze audit');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing audit:', error);
    throw error;
  }
}