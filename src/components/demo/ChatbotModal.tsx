import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Loader2, Send } from 'lucide-react';
import Portal from '../Portal';
import { useAuth } from '../../contexts/AuthContext';

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
  onClose
}) => {
  const { session } = useAuth();
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

  // Handle chat completion
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'bot') {
      // You can add logic here to detect when the chat is complete
      // For now, we'll just call onChatComplete when the modal closes
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const initializeChatSession = async () => {
    try {
      // Use our new chatbot API endpoint
      const sessionId = generateUUID();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Only add authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          action: 'initialize'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chatbot initialization response:', data);
        setChatSessionId(sessionId);
        // Add bot response from the webhook
        addMessage(data.response, 'bot');
      } else {
        console.error('Chatbot initialization error:', response.status, response.statusText);
        addMessage('I\'m having trouble connecting, please try again later.', 'bot');
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      addMessage('I\'m having trouble connecting, please try again later.', 'bot');
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
      // Use our new chatbot API endpoint
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Only add authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: chatSessionId,
          chatInput: userMessage,
          action: 'sendMessage'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chatbot response:', data);
        // Add bot response from the webhook
        addMessage(data.response, 'bot');
      } else {
        console.error('Chatbot API error:', response.status, response.statusText);
        addMessage('I\'m having trouble processing your message, please try again later.', 'bot');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('I\'m having trouble processing your message, please try again later.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
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

      </div>
      </div>
    </Portal>
  );
};

export default ChatbotModal;
