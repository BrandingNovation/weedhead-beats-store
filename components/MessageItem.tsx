import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, ExternalLink, AlertTriangle } from 'lucide-react';
import { Message, Role } from '../types';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex gap-4 p-4 md:p-6 ${isUser ? 'bg-transparent' : 'bg-slate-800/30'}`}>
      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'
      }`}>
        {isUser ? <User size={16} className="text-slate-300" /> : <Bot size={16} className="text-white" />}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="font-medium text-sm text-slate-300 mb-1">
          {isUser ? 'You' : 'Gemini'}
        </div>

        {/* User Attachments Display */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((att, idx) => (
              <img 
                key={idx}
                src={att.previewUrl} 
                alt="Uploaded" 
                className="max-w-[200px] max-h-[200px] rounded-lg border border-slate-700 object-cover"
              />
            ))}
          </div>
        )}

        {/* Message Content */}
        <div className={`prose prose-invert prose-sm max-w-none leading-relaxed ${isUser ? 'text-slate-200' : 'text-slate-100'}`}>
           {message.text ? (
             <ReactMarkdown 
               components={{
                 code: ({node, className, children, ...props}) => {
                   const match = /language-(\w+)/.exec(className || '')
                   return match ? (
                     <div className="relative group">
                       <div className="absolute right-2 top-2 text-xs text-slate-400 font-mono">{match[1]}</div>
                       <pre className="bg-slate-900/50 border border-slate-700/50 rounded-md p-4 overflow-x-auto my-2">
                         <code className={className} {...props}>
                           {children}
                         </code>
                       </pre>
                     </div>
                   ) : (
                     <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-200 font-mono text-xs" {...props}>
                       {children}
                     </code>
                   )
                 },
                 a: ({node, ...props}) => (
                    <a className="text-blue-400 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                 )
               }}
             >
               {message.text}
             </ReactMarkdown>
           ) : (
             <span className="inline-block w-2 h-4 bg-slate-500 animate-pulse rounded"></span>
           )}
        </div>
        
        {/* Error State */}
        {message.error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-2 bg-red-900/20 p-2 rounded border border-red-900/50 w-fit">
                <AlertTriangle size={14} />
                <span>Failed to generate response.</span>
            </div>
        )}

        {/* Grounding Sources */}
        {message.groundingSources && message.groundingSources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sources</div>
            <div className="flex flex-wrap gap-2">
              {message.groundingSources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-full px-3 py-1.5 text-xs text-slate-300 transition-colors"
                >
                  <ExternalLink size={10} />
                  <span className="truncate max-w-[150px]">{source.title || new URL(source.uri).hostname}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
