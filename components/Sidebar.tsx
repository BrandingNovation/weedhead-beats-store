import React, { useRef, useEffect } from 'react';
import { X, Sparkles, MessageSquare } from 'lucide-react';
import { AppConfig, Message } from '../types';
import MessageItem from './MessageItem';
import InputArea from './InputArea';

interface SidebarProps {
  config: AppConfig;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, attachments: any[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  config, 
  messages, 
  isLoading, 
  onSendMessage, 
  isOpen, 
  onClose 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-40"
          onClick={onClose}
        />
      )}
      
      {/* AI Panel */}
      <div className={`
        fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-brand-black border-l border-brand-slate z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-slate bg-brand-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center animate-pulse">
              <Sparkles className="text-white" size={16} />
            </div>
            <div>
              <h2 className="font-bold text-white">Studio Concierge</h2>
              <p className="text-xs text-brand-teal">Powered by Gemini 2.5</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-brand-slate rounded-full text-brand-teal hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-brand-black">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare size={40} className="text-brand-slate mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Need a hand?</h3>
              <p className="text-sm text-brand-teal max-w-xs">
                Ask me to write lyrics for the selected beat, explain the key signature, or suggest similar styles.
              </p>
            </div>
          ) : (
            <div className="py-4">
              {messages.map(msg => (
                <div key={msg.id} className="px-2">
                    <MessageItem message={msg} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-brand-slate bg-brand-black p-2">
            <InputArea onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
