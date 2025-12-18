import React, { useRef, useState, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Simple base64 conversion
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          const newAttachment: Attachment = {
            file,
            previewUrl: URL.createObjectURL(file),
            mimeType: file.type,
            base64Data: base64String,
          };
          setAttachments((prev) => [...prev, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="p-2">
      <div className="space-y-4">
        
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group shrink-0">
                <img 
                  src={att.previewUrl} 
                  alt="Attachment" 
                  className="h-20 w-20 object-cover rounded-lg border border-brand-slate"
                />
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-brand-slate/50 border border-brand-slate rounded-xl p-2 focus-within:ring-2 focus-within:ring-brand-green/50 focus-within:border-brand-green transition-all shadow-sm">
          <label htmlFor="chat-file-input" className="sr-only">Attach image</label>
          <input
            id="chat-file-input"
            name="chat-file-input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-brand-teal hover:text-brand-green hover:bg-brand-slate rounded-lg transition-colors"
            title="Attach image"
            aria-label="Attach image"
          >
            <ImageIcon size={20} />
          </button>

          <label htmlFor="chat-message-input" className="sr-only">Ask anything</label>
          <textarea
            id="chat-message-input"
            name="chat-message-input"
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-white placeholder:text-brand-teal resize-none outline-none py-2 max-h-[200px] overflow-y-auto"
            style={{ color: '#000000', caretColor: '#0D5F11' }}
            rows={1}
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading || (!text.trim() && attachments.length === 0)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isLoading || (!text.trim() && attachments.length === 0)
                ? 'bg-brand-slate text-brand-teal cursor-not-allowed'
                : 'bg-brand-green text-white hover:bg-brand-green/80 shadow-lg shadow-brand-green/20'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center text-xs text-brand-teal">
          Gemini may display inaccurate info, including about people, so double-check its responses.
        </div>
      </div>
    </div>
  );
};

export default InputArea;
