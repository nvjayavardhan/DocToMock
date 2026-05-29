import { useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://doctomock.onrender.com';

const useOpenAiMcqGenerator = () => {
  const generateMcqs = useCallback(
    async (content, sourceType = 'passage') => {
      const response = await fetch(`${API_BASE_URL}/api/auth/generateMcqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, sourceType })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate MCQs');
      }

      return response.json();
    },
    []
  );

  return { generateMcqs };
};

export default useOpenAiMcqGenerator;
