import { v4 as uuidv4 } from 'uuid';
import { Prompt, PromptVersion } from '../types';

/**
 * Generates a unique ID using UUID v4
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Formats an ISO date string into a readable format
 * @param dateString ISO 8601 date string
 * @param style 'short' | 'medium' | 'full'
 */
export const formatDate = (dateString: string, style: 'short' | 'medium' = 'medium'): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (style === 'short') {
    return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
  }
  
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Triggers a browser download for a JSON file using Blob
 * Uses Blob/URL.createObjectURL to support large libraries (>2MB)
 * @param filename Name of the file including extension
 * @param data Object to stringify
 */
export const downloadJson = (filename: string, data: any) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", url);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  
  // Clean up memory
  URL.revokeObjectURL(url);
};

/**
 * Safe filename sanitizer
 */
export const sanitizeFilename = (text: string): string => {
  return text.trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'untitled';
};

/**
 * Type Guard to validate if an object is a valid Prompt
 */
export const isValidPrompt = (data: any): data is Prompt => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    Array.isArray(data.tags) &&
    Array.isArray(data.versions)
  );
};