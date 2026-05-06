import { useStore } from '../store/useStore';

async function gitlabRequest(endpoint: string, options: RequestInit = {}) {
  const client = useStore.getState().getGitlabClient();
  if (!client) throw new Error('No active GitLab connection');

  const baseUrl = client.url.replace(/\/$/, '') + '/api/v4';
  
  // Clean endpoint ensuring a leading slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const separator = cleanEndpoint.includes('?') ? '&' : '?';
  const finalUrl = `${baseUrl}${cleanEndpoint}${separator}per_page=100`;

  const headers = {
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': client.token,
    ...options.headers,
  };

  const response = await fetch(finalUrl, { ...options, headers });
  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`GitLab API error: ${response.status} - ${errorDetails}`);
  }
  return response.json();
}

export async function fetchProjects() {
  return gitlabRequest('/projects?membership=true&simple=true');
}

export async function fetchIssues(projectId?: number) {
  const path = projectId ? `/projects/${projectId}/issues` : '/issues?scope=all';
  return gitlabRequest(path);
}

export async function createIssue(projectId: number, title: string, description: string, dueDate?: string, labels?: string) {
  return gitlabRequest(`/projects/${projectId}/issues`, {
    method: 'POST',
    body: JSON.stringify({ 
      title, 
      description,
      due_date: dueDate,
      labels
    }),
  });
}

export async function updateIssue(projectId: number, issueIid: number, data: any) {
  return gitlabRequest(`/projects/${projectId}/issues/${issueIid}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function searchIssues(query: string) {
  return gitlabRequest(`/issues?scope=all&search=${encodeURIComponent(query)}`);
}

