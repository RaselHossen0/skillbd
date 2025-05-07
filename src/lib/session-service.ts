/**
 * Service for handling session-related operations
 */

// Create a new session
export async function createSession(userRole: string, sessionData: any) {
  try {
    const response = await fetch('/api/dashboard/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userRole, sessionData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create session');
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Update an existing session
export async function updateSession(userRole: string, sessionId: string, sessionData: any) {
  try {
    const response = await fetch('/api/dashboard/sessions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userRole, sessionId, sessionData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update session');
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

// Delete a session
export async function deleteSession(userRole: string, sessionId: string) {
  try {
    const response = await fetch(`/api/dashboard/sessions?sessionId=${sessionId}&userRole=${userRole}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete session');
    }

    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

// Fetch available mentors for student session creation
export async function fetchAvailableMentors() {
  try {
    const response = await fetch('/api/users/mentors');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch mentors');
    }

    const data = await response.json();
    return data.mentors || [];
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return [];
  }
}

// Fetch available students for mentor session creation
export async function fetchAvailableStudents() {
  try {
    const response = await fetch('/api/users/students');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch students');
    }

    const data = await response.json();
    return data.students || [];
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

// Fetch available applicants for employer session creation
export async function fetchAvailableApplicants() {
  try {
    const response = await fetch('/api/users/applicants');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch applicants');
    }

    const data = await response.json();
    return data.applicants || [];
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return [];
  }
}

// Fetch jobs for a specific employer
export async function fetchEmployerJobs(employerId: string) {
  try {
    const response = await fetch(`/api/jobs?employerId=${employerId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch jobs');
    }

    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
} 