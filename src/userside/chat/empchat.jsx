/* eslint-disable react/prop-types */
import '../../Styles/chat.css';
import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { AuthContext } from './../Provider/AuthProvider';
import { FaPaperclip, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaDownload } from "react-icons/fa";
import { base_url, chat_url } from '../../config/config';
import { IoSend } from "react-icons/io5";
import { IoChatbubblesOutline, IoChatbubbles } from "react-icons/io5";

const isImage = (mimetype) => mimetype?.startsWith('image/');

const FileIcon = ({ mimetype }) => {
  if (mimetype?.includes('pdf')) return <FaFilePdf className="text-red-400" size={20} />;
  if (mimetype?.includes('word') || mimetype?.includes('document')) return <FaFileWord className="text-blue-400" size={20} />;
  if (mimetype?.includes('sheet') || mimetype?.includes('excel')) return <FaFileExcel className="text-green-400" size={20} />;
  return <FaFileAlt className="text-gray-400" size={20} />;
};

const AttachmentPreview = ({ attachments, isClient }) => {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-1">
      {attachments.map((file, i) => {
        if (isImage(file.mimetype)) {
          return (
            <a key={i} href={`${base_url}${file.url}`} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={`${base_url}${file.url}`}
                alt={file.originalName}
                className="max-w-[240px] max-h-[200px] rounded-lg object-cover border border-white/20 hover:opacity-90 transition-opacity cursor-pointer"
              />
            </a>
          );
        }
        return (
        <a  
            key={i}
            href={`${base_url}${file.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 hover:opacity-80 no-underline ${
              isClient ? 'bg-blue-700 border-blue-500 text-white' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <FileIcon mimetype={file.mimetype} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-[160px]">{file.originalName}</span>
              <span className={`text-[10px] ${isClient ? 'text-blue-200' : 'text-gray-400'}`}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <FaDownload size={12} className="ml-auto flex-shrink-0 opacity-70" />
          </a>
        );
      })}
    </div>
  );
};

// ✅ Outside component
const SeenLabel = ({ read }) => (
  read
    ? <span className="text-[10px] text-blue-300 mt-0.5">Seen</span>
    : <span className="text-[10px] text-blue-200 mt-0.5">Sent</span>
);

const Echat = ({ selectedTaskId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages]       = useState([]);
  const [inputValue, setInputValue]   = useState('');
  const [socket, setSocket]           = useState(null);
  const [isSending, setIsSending]     = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const fileInputRef       = useRef(null);
  const scrollContainerRef = useRef(null);
  const isNearBottomRef    = useRef(true);
  const prevMessageCountRef = useRef(0);

  const checkIfNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 120;
  };

  const scrollToBottom = useCallback((force = false) => {
    if (force || isNearBottomRef.current) {
      const container = scrollContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;
    if (isNewMessage) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedTaskId) {
      isNearBottomRef.current = true;
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [selectedTaskId, scrollToBottom]);

  // ✅ Mark manager's messages as read when component mounts/task changes
  const markMessagesRead = async () => {
    if (!selectedTaskId) return;
    try {
      await fetch(`${base_url}/empchat/mark-read/${selectedTaskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'manager' }),
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  useEffect(() => {
    if (selectedTaskId) markMessagesRead();
  }, [selectedTaskId]);

  /* fetch + poll */
  useEffect(() => {
    if (!selectedTaskId) return;
    const load = async () => {
      try {
        const response = await fetch(`${base_url}/empchat/${selectedTaskId}`);
        if (!response.ok) throw new Error();
        setMessages(await response.json());
      } catch { /* silent */ }
    };
    load();
    const interval = setInterval(load, 300);
    return () => clearInterval(interval);
  }, [selectedTaskId]);

  /* websocket */
  useEffect(() => {
    if (!selectedTaskId) return;

    const newSocket = new WebSocket(`${chat_url}?taskId=${selectedTaskId}`);
    newSocket.onopen = () => console.log('Connected to WebSocket');
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // ✅ Ignore initial array dump
      if (Array.isArray(data)) return;

      // ✅ Handle read_update — manager has seen employee's messages
      if (data.type === 'read_update') {
        setMessages(prev =>
          prev.map(m => m.sender === data.sender ? { ...m, read: true } : m)
        );
        return;
      }

      // ✅ Mark manager's message as read immediately (chat is always open)
      if (data.sender === 'manager') markMessagesRead();

      setMessages(prev => {
        if (!prev.some(msg => msg.time === data.time && msg.text === data.text)) {
          return [...prev, data];
        }
        return prev;
      });
    };
    newSocket.onerror = (error) => console.error('WebSocket error:', error);
    newSocket.onclose = () => console.log('WebSocket disconnected');
    setSocket(newSocket);
    return () => newSocket.close();
  }, [selectedTaskId]);

  const removeAttachedFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    const hasText  = inputValue.trim();
    const hasFiles = attachedFiles.length > 0;
    if ((!hasText && !hasFiles) || isSending) return; // ✅ removed socket readyState check

    setIsSending(true);
    isNearBottomRef.current = true;
    try {
      if (hasFiles) {
        const formData = new FormData();
        formData.append('taskId',   selectedTaskId);
        formData.append('empId',    user?.userId);
        formData.append('empName',  user?.rname);
        formData.append('sender',   'emp');
        formData.append('time',     new Date().toISOString());
        formData.append('text',     hasText || attachedFiles.map(f => f.name).join(', '));
        attachedFiles.forEach(file => formData.append('files', file));

        const response = await fetch(`${base_url}/addempchat/files`, { method: 'POST', body: formData });
        const savedMessage = await response.json();
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(savedMessage));
        setMessages(prev => [...prev, savedMessage]);
      } else {
        const message = {
          taskId: selectedTaskId,
          empId:  user?.userId,
          empName: user?.rname,
          sender: 'emp',
          text:   inputValue,
          time:   new Date().toISOString(),
          read:   false,
        };
        await fetch(`${base_url}/addempchat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
        setMessages(prev => [...prev, message]);
      }
      setInputValue('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const lastEmpMsgIndex = messages.map(m => m.sender).lastIndexOf('emp');

  const ChatWindow = (
    <div className="flex flex-col h-[85vh] lg:w-[80vh] bg-white md:w-full rounded-sm overflow-hidden border border-gray-50">
      <div className="flex flex-col h-full">
        {!selectedTaskId ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center p-6 bg-gray-50 rounded-sm border border-dashed border-gray-200">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No task selected</p>
            <p className="text-sm text-gray-400">Pick a task from the list to start chatting.</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 w-full border-b border-gray-100 justify-between flex flex-row text-black">
              <div className="text-lg md:text-xl font-semibold text-gray-700">Chat</div>
              <div className="text-sm md:text-base text-gray-500 font-medium">Task: {selectedTaskId}</div>
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={() => { isNearBottomRef.current = checkIfNearBottom(); }}
              className="flex-1 overflow-y-auto px-3 py-2 space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#93c5fd #f1f5f9' }}
            >
              {messages.map((msg, index) => {
                const isEmp = msg.sender === 'emp';
                return (
                  <div key={index} className={`flex flex-col ${isEmp ? 'items-end' : 'items-start'}`}>
                    <div className={`chat ${isEmp ? 'chat-end' : 'chat-start'} w-full`}>
                      <div className="chat-image avatar">
                        <div className="w-10">
                          <img
                            className="rounded-full"
                            src={isEmp
                              ? user?.rppic
                              : 'https://i.ibb.co.com/N6wDTM7G/icon.png'}
                          />
                        </div>
                      </div>
                      <div className="chat-header flex flex-row items-center">
                        <p>{isEmp ? user?.rname : 'Manager'}</p>
                        <time className="text-xs opacity-50">
                          {' '} - {new Date(msg.time).toLocaleTimeString()}
                        </time>
                      </div>
                      <div className={`chat-bubble w-fit max-w-xs ${
                        isEmp ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'
                      }`}>
                        {msg.text && !msg.text.startsWith('📎') && <p className="mb-1">{msg.text}</p>}
                        <AttachmentPreview attachments={msg.attachments} isClient={isEmp} />
                      </div>
                    </div>
                    {/* ✅ Seen label below last emp message only */}
                    {isEmp && index === lastEmpMsgIndex && (
                      <SeenLabel read={msg.read} />
                    )}
                  </div>
                );
              })}
            </div>

            {attachedFiles.length > 0 && (
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm">
                    <FaPaperclip size={10} className="text-blue-400" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachedFile(index)}
                      className="ml-1 text-gray-400 hover:text-red-500 transition-colors font-bold leading-none"
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="sticky bottom-0 p-1 flex items-center gap-1 bg-white border-t border-gray-200">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onClick={e => { e.target.value = null; }} // ✅ allow reselecting same file
                onChange={e => {
                  const files = Array.from(e.target.files);
                  if (files.length) setAttachedFiles(p => [...p, ...files]);
                }}
              />
              <button
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}
                title="Attach files"
                className="flex-shrink-0 p-2 md:p-3 h-10 rounded-md bg-white border border-gray-200 text-gray-400 hover:text-blue-500 hover:bg-gray-50 transition-all duration-200"
              >
                <FaPaperclip size={16} />
              </button>
              <input
                className="flex-1 px-4 py-2 md:py-3 h-10 text-sm md:text-base bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-300"
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && attachedFiles.length === 0) || isSending}
                className={`flex-shrink-0 px-4 md:px-6 py-2 h-10 md:py-3 rounded-md text-sm md:text-base font-medium text-white transition-all duration-200 ${
                  (!inputValue.trim() && attachedFiles.length === 0) || isSending
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-md'
                }`}
              >
                <IoSend />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden w-full lg:flex">
        {selectedTaskId ? ChatWindow : (
          <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No task selected</p>
            <p className="text-sm text-gray-400">Pick a task from the list to start chatting.</p>
          </div>
        )}
      </div>

      {selectedTaskId && (
        <div className="lg:hidden fixed bottom-4 right-4 z-[40]">
          <button
            onClick={() => setIsMobileChatOpen(prev => !prev)}
            className="p-4 rounded-full shadow-md transition-all duration-200 text-white bg-blue-700 hover:bg-blue-800"
          >
            {isMobileChatOpen ? <IoChatbubbles size={24} /> : <IoChatbubblesOutline size={24} />}
          </button>
          {isMobileChatOpen && (
            <div className="fixed bottom-20 right-2 w-[90vw] h-[80vh] bg-white rounded-md shadow-md overflow-hidden border border-gray-200">
              {ChatWindow}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Echat;