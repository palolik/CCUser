/* eslint-disable react/prop-types */
import '../../Styles/chat.css';
import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { AuthContext } from './../Provider/AuthProvider';
import { FaComments, FaPaperclip, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaDownload } from "react-icons/fa";
import { base_url } from '../../config/config';
import { chat_url } from '../../config/config';
import { IoSend } from "react-icons/io5";
import { PiChatCircleTextFill } from "react-icons/pi";
import { IoChatbubblesOutline ,  IoChatbubbles  } from "react-icons/io5";


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
            <a
              key={i}
              href={`${base_url}${file.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={`${base_url}${file.url}`}
                alt={file.originalName}
                className="max-w-[240px] max-h-[200px] rounded-lg object-cover border border-white/20 hover:opacity-90 transition-opacity cursor-pointer "
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
              isClient
                ? 'bg-blue-700 border-blue-500 text-white'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <FileIcon mimetype={file.mimetype} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-[160px]">
                {file.originalName}
              </span>
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

const Cchat = ({ selectedProjectId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  // Track whether the user is near the bottom so we only auto-scroll when appropriate
  const isNearBottomRef = useRef(true);
const isOpenRef = useRef(true); // client chat is always visible when rendered

  const checkIfNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    const threshold = 120; // px from bottom counts as "near bottom"
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };
const scrollToBottom = useCallback((force = false) => {
  if (force || isNearBottomRef.current) {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight; // ✅ scrolls only the chat box
    }
  }
}, []);

useEffect(() => {
  if (selectedProjectId) markMessagesRead();
}, [selectedProjectId]);

const markMessagesRead = async () => {
  if (!selectedProjectId) return;
  try {
    await fetch(`${base_url}/clichat/mark-read/${selectedProjectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "manager" }), // mark manager's msgs as read
    });
  } catch (err) {
    console.error("Error marking as read:", err);
  }
};
  // Only auto-scroll when a NEW message arrives and user is near the bottom
  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (isNewMessage) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Force scroll to bottom when project first selected
  useEffect(() => {
    if (selectedProjectId) {
      isNearBottomRef.current = true;
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [selectedProjectId, scrollToBottom]);

  const fetchMessages = async () => {
    if (!selectedProjectId) return;
    try {
      const response = await fetch(`${base_url}/clichat/${selectedProjectId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 300);
    return () => clearInterval(interval);
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    if (socket) socket.close();

    const newSocket = new WebSocket(`${chat_url}?orderId=${selectedProjectId}`);
    newSocket.onopen = () => console.log('Connected to WebSocket');
   newSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Ignore initial history array dump
  if (Array.isArray(data)) return;

  // Handle read_update — manager has seen client's messages
  if (data.type === "read_update") {
    setMessages(prev =>
      prev.map(m =>
        m.sender === data.sender ? { ...m, read: true } : m
      )
    );
    return;
  }

  // Mark manager's message as read immediately if chat is open
  if (data.sender === "manager") markMessagesRead();

  setMessages((prevMessages) => {
    if (!prevMessages.some(msg => msg.time === data.time && msg.text === data.text)) {
      return [...prevMessages, data];
    }
    return prevMessages;
  });
};
    newSocket.onerror = (error) => console.error('WebSocket error:', error);
    newSocket.onclose = () => console.log('WebSocket Disconnected');
    setSocket(newSocket);

    return () => newSocket.close();
  }, [selectedProjectId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeAttachedFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const SeenLabel = ({ read }) => (
  read
    ? <span className="text-[10px] text-blue-300 mt-0.5">Seen</span>
    : <span className="text-[10px] text-blue-200 mt-0.5">Sent</span>
);

const lastClientMsgIndex = messages.map(m => m.sender).lastIndexOf("client");

  const handleSendMessage = async () => {
    const hasText = inputValue.trim();
    const hasFiles = attachedFiles.length > 0;

    if ((!hasText && !hasFiles) || !socket || socket.readyState !== WebSocket.OPEN || isSending) return;

    try {
      setIsSending(true);
      // When user sends, always scroll to bottom
      isNearBottomRef.current = true;

      if (hasFiles) {
        const formData = new FormData();
        formData.append('orderId', selectedProjectId);
        formData.append('bId', user?.userId);
        formData.append('bName', user?.rname);
        formData.append('sender', 'client');
        formData.append('time', new Date().toISOString());
        if (hasText) formData.append('text', inputValue);
        attachedFiles.forEach((file) => formData.append('files', file));

        const response = await fetch(`${base_url}/addclichat/files`, {
          method: 'POST',
          body: formData,
        });

        const savedMessage = await response.json();
        socket.send(JSON.stringify(savedMessage));
        setMessages((prev) => [...prev, savedMessage]);
      } else {
        const message = {
          orderId: selectedProjectId,
          bId: user?.userId,
          bName: user?.rname,
          sender: 'client',
          text: inputValue,
          time: new Date().toISOString(),
        };

        await fetch(`${base_url}/addclichat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        socket.send(JSON.stringify(message));
        setMessages((prev) => [...prev, message]);
      }

      setInputValue('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const ChatWindow = (
    <div className="flex flex-col h-[80vh] w-full md:w-full bg-white rounded-sm  overflow-hidden border border-gray-50">
      <div className="flex flex-col h-full">
        {!selectedProjectId ? (
           <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center p-6 bg-gray-50 rounded-sm border border-dashed border-gray-200">
    <div className="text-5xl mb-4">💬</div>
    <p className="text-lg font-semibold text-gray-700 mb-1">No project selected</p>
    <p className="text-sm text-gray-400">Pick a project from the list on the right to start chatting with the team.</p>
  </div>
        ) : (
          <>
         
            <div className="px-5 py-4 border-b border-gray-100 justify-between flex flex-row text-black ">
            <h2 className=" font-semibold tracking-wide">Chat</h2>
            <p className=" text-xs mt-0.5"> Project: {selectedProjectId}</p>
             </div>

            <div
              ref={scrollContainerRef}
              onScroll={() => { isNearBottomRef.current = checkIfNearBottom(); }}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#93c5fd #f1f5f9' }}
            >
              {messages.map((msg, index) => {
                const isClient = msg.sender === 'client';
                return (
                  <div key={index} className={`chat ${isClient ? 'chat-end' : 'chat-start'}`}>
                    <div className="chat-image avatar">
                      <div className="w-10">
                        <img
                          className="rounded-full"
                          src={isClient
                            ? user?.rppic
                            : 'https://static-00.iconduck.com/assets.00/user-avatar-1-icon-2048x2048-935gruik.png'}
                        />
                      </div>
                    </div>
                    <div className="chat-header flex flex-row items-center">
                      <p>{isClient ? user?.rname : 'Manager'}</p>
                      <time className="text-xs opacity-50">
                        {' '} - {new Date(msg.time).toLocaleTimeString()}
                      </time>
                    </div>
                    <div
                      className={`chat-bubble w-fit max-w-xs ${
                        isClient ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'
                      }`}
                    >
                      {msg.text && !msg.text.startsWith('📎') && (
                        <p className="mb-1">{msg.text}</p>
                      )}

                      <AttachmentPreview attachments={msg.attachments} isClient={isClient} />
                    </div>
                    {isClient && index === lastClientMsgIndex && (
  <div className="flex justify-end mt-0.5">
    <SeenLabel read={msg.read} />
  </div>
)}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {attachedFiles.length > 0 && (
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm"
                  >
                    <FaPaperclip size={10} className="text-blue-400" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachedFile(index)}
                      className="ml-1 text-gray-400 hover:text-red-500 transition-colors font-bold leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

       
            <div className="sticky bottom-0 p-1 flex items-center gap-1 bg-white border-t border-gray-200">

          
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="*/*"
                className="hidden"
                onChange={handleFileChange}
              />

            
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
                className="flex-shrink-0 p-2 md:p-3  h-10 rounded-md bg-white border border-gray-200 text-gray-400 hover:text-blue-500 hover:bg-gray-50 transition-all duration-200"
              >
                <FaPaperclip size={16} />
              </button>

              {/* Text input — middle */}
              <input
                className="flex-1 px-4 py-2 md:py-3 h-10 text-sm md:text-base bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-300"
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />

              {/* Send button — RIGHT of textarea */}
              <button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && attachedFiles.length === 0) || isSending}
                className={`flex-shrink-0 px-4 md:px-6 py-2  h-10 md:py-3 rounded-md text-sm md:text-base font-medium text-white transition-all duration-200 ${
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
      {/* Desktop chat */}
      <div className="hidden lg:flex w-full h-full">
        {selectedProjectId ? ChatWindow : (
         <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
    <div className="text-5xl mb-4">💬</div>
    <p className="text-lg font-semibold text-gray-700 mb-1">No project selected</p>
    <p className="text-sm text-gray-400">Pick a project from the list on the right to start chatting with the team.</p>
  </div>
        )}
      </div>

      {/* Mobile floating chat */}
      {selectedProjectId && (
        <div className="lg:hidden fixed bottom-4 right-4 z-[40]">
          <button
            onClick={() => setIsMobileChatOpen((prev) => !prev)}
            className={`p-4 rounded-full shadow-md transition-all duration-200 text-white bg-blue-700 hover:bg-blue-800'
            }`}
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

export default Cchat;