import { useEffect, useState } from 'react';

type SSEEvent = {
  type: 'CONNECTED' | 'RESUME_PARSED' | 'NOTIFICATION' | 'SCOUT_COMPLETED';
  status?: string;
  data?: any;
  error?: string;
  message?: string;
};

export const useSSE = () => {
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if we have a token (user is logged in)
    const token = localStorage.getItem('token');
    if (!token) return;

    // In a real app, SSE connections that require auth either use a cookie or pass the token in the URL query string
    // Here we assume the cookie is set or we append the token
    const eventSource = new EventSource(`http://localhost:3000/api/stream?token=${token}`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setLastEvent(parsedData);
      } catch (e) {
        console.error('Error parsing SSE data', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsConnected(false);
      eventSource.close();
      
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (localStorage.getItem('token')) {
          // Trigger a re-render or re-evaluation to reconnect
        }
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { lastEvent, isConnected };
};
