import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { BackButton } from '../../components/ui/BackButton';

export function Assistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your CareerScout AI Assistant. I can help you find jobs, analyze your resume, or prepare for interviews. What would you like to do?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'I am analyzing your request. (Integration pending)' }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <BackButton fallback="/dashboard" label="Back to Dashboard" />
        <div className="mb-6 flex items-center">
          <Bot className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Career Assistant</h1>
            <p className="text-gray-500">Powered by Gemini</p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <Input 
                value={input} 
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me to find internships in London..." 
                className="flex-1"
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
