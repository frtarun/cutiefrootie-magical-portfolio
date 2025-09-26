/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { showcaseProjects, tutorialVideos } from './data';
import { ShowcaseProject, TutorialVideo } from './types';

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:4000';

async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    // Fallback to local data if backend is not available
    return fallback;
  }
}

/**
 * Fetch showcase projects from backend or fallback to local data.
 */
export const fetchShowcaseProjects = (): Promise<ShowcaseProject[]> => {
  return safeFetchJson<ShowcaseProject[]>(`${API_BASE}/api/showcase-projects`, showcaseProjects);
};

/**
 * Fetch tutorial videos from backend or fallback to local data.
 */
export const fetchTutorialVideos = (): Promise<TutorialVideo[]> => {
  return safeFetchJson<TutorialVideo[]>(`${API_BASE}/api/tutorial-videos`, tutorialVideos);
};
