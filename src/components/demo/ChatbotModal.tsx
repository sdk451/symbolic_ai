import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Loader2, AlertCircle, Send } from 'lucide-react';
import { useDemoExecution } from '../../hooks/useDemoExecution';
import Portal from '../Portal';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatComplete?: (result: any) => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  onChatComplete
}) => {
  const { status, startDemo, clearRun } = useDemoExecution();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session when modal opens
  useEffect(() => {
    if (isOpen && !chatSessionId) {
      initializeChatSession();
    }
  }, [isOpen, chatSessionId]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the modal container to ensure it captures all events
      const modalElement = document.querySelector('[data-modal="chatbot"]') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle demo status changes
  useEffect(() => {
    if (status?.status === 'succeeded' && status.outputData) {
      onChatComplete?.(status.outputData);
    }
  }, [status, onChatComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChatSession = async () => {
    try {
      const result = await startDemo('customer-service-chatbot', {
        sessionId: `chat-${Date.now()}`,
        messageCount: 0,
        startTime: new Date().toISOString()
      });

      if (result.success) {
        setChatSessionId(result.runId || null);
        // Add welcome message
        addMessage('Hello! I\'m your AI customer service assistant. How can I help you today?', 'bot');
      } else {
        addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'bot');
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'bot');
    }
  };

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    addMessage(userMessage, 'user');

    try {
      // Simulate bot response (in real implementation, this would call the chatbot API)
      setTimeout(() => {
        const responses = [
          "That's a great question! Let me help you with that.",
          "I understand your concern. Here's what I can tell you...",
          "Thank you for reaching out. Based on what you've described...",
          "I'd be happy to assist you with that. Let me provide some information...",
          "That's a common question. Here's what you need to know..."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'bot');
        setIsLoading(false);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds

    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('Sorry, I encountered an error. Please try again.', 'bot');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    clearRun();
    setMessages([]);
    setChatSessionId(null);
    setInputMessage('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
        onClick={handleClose}
        onMouseDown={(e) => e.preventDefault()}
        data-modal="chatbot"
        tabIndex={-1}
      >
      <div 
        className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg max-w-2xl w-full h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-500/20">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 mr-3">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Customer Service Chat</h2>
              <p className="text-sm text-gray-400">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 rounded-lg p-3 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">AI is typing...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-orange-500/20">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Demo Status Display */}
        {status && (
          <div className="p-3 border-t border-orange-500/20 bg-orange-500/10">
            {status.status === 'queued' && (
              <div className="flex items-center text-blue-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Initializing chat session...</span>
              </div>
            )}
            {status.status === 'running' && (
              <div className="flex items-center text-yellow-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Chat session active</span>
              </div>
            )}
            {status.status === 'failed' && (
              <div className="flex items-center text-red-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Chat session failed: {status.errorMessage || 'Unknown error'}</span>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </Portal>
  );
};

export default ChatbotModal;
