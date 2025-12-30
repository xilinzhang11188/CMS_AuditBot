// API configuration and functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface Audit {
  id: string;
  userId: string;
  organizationId: string;
  codeId: string;
  noteText: string;
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
  deletedAt?: string;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'provider' | 'manager';
  organizationId: string;
  quotaUsed: number;
  quotaLimit: number;
}

// API functions
export async function fetchAudits(limit: number = 50, skip: number = 0): Promise<Audit[]> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/audits?limit=${limit}&skip=${skip}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch audits');
    }
    
    const data = await response.json();
    // Transform _id to id for frontend compatibility
    return data.map((audit: any) => ({
      ...audit,
      id: audit._id || audit.id
    }));
  } catch (error) {
    console.error('Error fetching audits:', error);
    return [];
  }
}

export async function fetchOrganizationQuota(): Promise<{ used: number; limit: number }> {
  try {
    const token = localStorage.getItem('authToken');
    console.log('DEBUG: Fetching quota from:', `${API_BASE_URL}/api/v1/organizations/quota`);
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/quota`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('DEBUG: Quota response status:', response.status);
    if (!response.ok) {
      console.error('DEBUG: Quota fetch failed with status:', response.status);
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
    console.log('DEBUG: Sending analyze request:', request);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/audits/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('DEBUG: Analyze response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG: Analyze error data:', errorData);
      throw new Error(errorData.detail || 'Failed to analyze audit');
    }

    const responseData = await response.json();
    console.log('DEBUG: Full analyze response:', responseData);
    console.log('DEBUG: Audit object:', responseData.audit);
    console.log('DEBUG: Audit ID:', responseData.audit?.id);
    
    return responseData;
  } catch (error) {
    console.error('Error analyzing audit:', error);
    throw error;
  }
}

export interface AuditHistoryParams {
  search?: string;
  riskLevel?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditHistoryResponse {
  audits: Audit[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchAuditHistory(params: AuditHistoryParams = {}): Promise<AuditHistoryResponse> {
  try {
    const token = localStorage.getItem('authToken');
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.riskLevel) searchParams.append('riskLevel', params.riskLevel);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/audits/history?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch audit history');
    }

    const data = await response.json();
    // Transform _id to id for frontend compatibility
    return {
      ...data,
      audits: data.audits.map((audit: any) => ({
        ...audit,
        id: audit._id || audit.id
      }))
    };
  } catch (error) {
    console.error('Error fetching audit history:', error);
    throw error;
  }
}

export async function deleteAudit(auditId: string): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/audits/${auditId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete audit');
    }
  } catch (error) {
    console.error('Error deleting audit:', error);
    throw error;
  }
}

export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch user profile');
    }

    const data = await response.json();
    return {
      ...data,
      id: data._id || data.id
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(updates: { name?: string; email?: string }): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/users/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to change password');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

export async function fetchAuditById(auditId: string): Promise<Audit> {
  try {
    const token = localStorage.getItem('authToken');
    console.log('DEBUG: Fetching audit by ID:', auditId);
    console.log('DEBUG: Audit URL:', `${API_BASE_URL}/api/v1/audits/${auditId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/audits/${auditId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('DEBUG: Audit fetch response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG: Audit fetch error data:', errorData);
      throw new Error(errorData.detail || 'Audit not found');
    }

    const auditData = await response.json();
    console.log('DEBUG: Received audit data:', auditData);
    // Transform _id to id for frontend compatibility
    return {
      ...auditData,
      id: auditData._id || auditData.id
    };
  } catch (error) {
    console.error('Error fetching audit:', error);
    throw error;
  }
}