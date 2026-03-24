import { useEffect, useState, useRef } from "react";
import { X, Send } from "lucide-react";
import { base_url, chat_url } from "../../../config/config";

const SeenLabel = ({ read }) => (
  read
    ? <span className="text-[10px] text-cyan-400 mt-0.5">Seen</span>
    : <span className="text-[10px] text-gray-400 mt-0.5">Sent</span>
);

const PhoneSupportChat = ({ onClose }) => {
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [supportId, setSupportId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const isOpenRef = useRef(true); // phone chat is always open when mounted

  // Load user from localStorage
  useEffect(() => {
    const authRaw = localStorage.getItem("authUser");
    if (authRaw) {
      try {
        const authUser = JSON.parse(authRaw);
        if (authUser?.email && authUser?.rname) {
          setUserInfo({ name: authUser.rname, email: authUser.email });
          setSupportId(authUser.email.trim().toLowerCase());
          setIsFormSubmitted(true);
          return;
        }
      } catch (e) {}
    }

    const guestRaw = localStorage.getItem("supportUser");
    if (guestRaw) {
      try {
        const guest = JSON.parse(guestRaw);
        if (guest?.name && guest?.email) {
          setUserInfo(guest);
          setSupportId(guest.email.trim().toLowerCase());
          setIsFormSubmitted(true);
        }
      } catch (e) {}
    }
  }, []);

  // Mark manager's messages as read (only when component is mounted/visible)
  const markMessagesRead = async () => {
    if (!supportId) return;
    try {
      await fetch(`${base_url}/schat/mark-read/${supportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "manager" }),
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const fetchMessages = async () => {
    if (!supportId) return;
    try {
      const res = await fetch(`${base_url}/schat/${supportId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark as read on mount (phone chat is open the moment it renders)
  useEffect(() => {
    if (supportId) markMessagesRead();
  }, [supportId]);

  // Cleanup: mark as untracked when unmounted
  useEffect(() => {
    return () => {
      isOpenRef.current = false;
    };
  }, []);

  // Polling + WebSocket
  useEffect(() => {
    if (!supportId) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);

    const newSocket = new WebSocket(`${chat_url}?supportId=${supportId}`);

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // ✅ Ignore the initial array dump on connect — polling handles history
      if (Array.isArray(data)) return;

      setMessages((prev) =>
        prev.some((m) => m.time === data.time && m.text === data.text)
          ? prev
          : [...prev, data]
      );

      // ✅ Only mark read if component is still mounted and visible
      if (isOpenRef.current && data.sender === "manager") markMessagesRead();
    };

    setSocket(newSocket);
    return () => {
      newSocket.close();
      clearInterval(interval);
    };
  }, [supportId]);


  const handleSendMessage = async () => {
    if (!inputValue.trim() || !supportId || isSending) return;

    const message = {
      supportId,
      bId: userInfo.email,
      bName: userInfo.name,
      text: inputValue,
      time: new Date(),
      sender: "user",
      read: false,
    };

    setIsSending(true);
    try {
      await fetch(`${base_url}/addschat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      if (newSocket?.readyState === WebSocket.OPEN) newSocket.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setInputValue("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (userInfo.name.trim() && userInfo.email.trim()) {
      const emailId = userInfo.email.trim().toLowerCase();
      setSupportId(emailId);
      setIsFormSubmitted(true);
      localStorage.setItem("supportUser", JSON.stringify(userInfo));
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-blue-600 text-white">
        <div>
          <p className="font-semibold">Support Chat</p>
          {isFormSubmitted && (
            <p className="text-xs text-blue-100">{userInfo.name}</p>
          )}
        </div>
        <button onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      {!isFormSubmitted ? (
        <form onSubmit={handleFormSubmit} className="p-4 space-y-3 flex-1">
          <p className="text-gray-600 text-sm">Enter your details to start:</p>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
          >
            Start Chat
          </button>
        </form>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-10">
                Start your conversation below 👋
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}
                >
                  <div className="chat-header flex items-center gap-1">
                    <p className="font-medium text-sm">
                      {msg.sender === "user" ? userInfo.name : "Support Team"}
                    </p>
                    <time className="text-xs opacity-50">
                      {new Date(msg.time).toLocaleTimeString()}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble w-fit ${
                      msg.sender === "user"
                        ? "bg-cyan-50 text-black"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === "user" && i === messages.length - 1 && (
                    <div className="chat-footer">
                      <SeenLabel read={msg.read} />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t flex items-center p-2 gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-l-md focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSending}
              className={`px-4 py-2 rounded-r-md text-white text-sm font-medium ${
                !inputValue.trim() || isSending
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneSupportChat;