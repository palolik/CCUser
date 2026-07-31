import { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { base_url, chat_url } from "../../../config/config";

const SeenLabel = ({ read }) => (
  read
    ? <span className="text-[10px] text-blue-300 mt-0.5">Seen</span>
    : <span className="text-[10px] text-blue-200 mt-0.5">Sent</span>
);

const SupportChat = ({ forceOpen = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [supportId, setSupportId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSessionClosed, setIsSessionClosed] = useState(false);

  const chatEndRef = useRef(null);
  const isOpenRef = useRef(false);
  const socketRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
  if (!isOpen || !isFormSubmitted) return;

  requestAnimationFrame(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  });
}, [messages, isOpen, isFormSubmitted]);
  useEffect(() => {
    isOpenRef.current = isOpen;
    // Mark manager messages as read when user opens the chat
    if (isOpen && supportId && !isSessionClosed) markMessagesRead();
  }, [isOpen, supportId, isSessionClosed]);

  // Load user from localStorage
  useEffect(() => {
    const sessionClosed = localStorage.getItem("supportChatClosed") === "true";

    if (sessionClosed) {
      setIsSessionClosed(true);
      setIsFormSubmitted(false);
      setSupportId(null);
      setMessages([]);
      return;
    }

    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const decoded = JSON.parse(storedUser);
        if (decoded?.email && decoded?.rname) {
          const user = { name: decoded.rname, email: decoded.email };
          setUserInfo(user);
          setSupportId(decoded.email.trim().toLowerCase());
          setIsFormSubmitted(true);
          return;
        }
      } catch (e) {
        console.error("Failed to parse authUser:", e);
      }
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
      } catch (e) {
        console.error("Failed to parse supportUser:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (forceOpen && !isSessionClosed) setIsOpen(true);
  }, [forceOpen, isSessionClosed]);

  // Mark manager's messages as read (called only when chat is open)
  const markMessagesRead = async () => {
    if (!supportId) return;
    try {
      await fetch(`${base_url}/schat/mark-read/${supportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "manager" }), // mark manager's msgs as read
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const fetchMessages = async () => {
    if (!supportId || isSessionClosed) return;
    try {
      const response = await fetch(`${base_url}/schat/${supportId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching support chat messages:", err);
    }
  };

 useEffect(() => {
  if (!supportId || isSessionClosed) return;

  fetchMessages();

  const newSocket = new WebSocket(`${chat_url}?supportId=${supportId}&userId=${supportId}`);
  socketRef.current = newSocket;

  newSocket.onopen = () => console.log("Support chat WebSocket connected");

  newSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (Array.isArray(data)) {
      setMessages(data);
      return;
    }

    setMessages((prev) => {
      const alreadyExists = prev.some((msg) => {
        if (msg._id && data._id) return msg._id === data._id;

        return (
          String(msg.time) === String(data.time) &&
          msg.text === data.text &&
          msg.sender === data.sender
        );
      });

      if (alreadyExists) return prev;

      return [...prev, data];
    });

    if (isOpenRef.current && data.sender === "manager") {
      markMessagesRead();
    }
  };

  newSocket.onclose = () => console.log("Support chat WebSocket closed");

  setSocket(newSocket);

  return () => {
    newSocket.close();
  };
}, [supportId, isSessionClosed]);

  const handleCloseChatSession = () => {
    localStorage.setItem("supportChatClosed", "true");
    localStorage.removeItem("supportUser");

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setSocket(null);
    setIsOpen(false);
    setIsSessionClosed(true);
    setIsFormSubmitted(false);
    setSupportId(null);
    setMessages([]);
    setInputValue("");
    setUserInfo({ name: "", email: "" });
  };

  const handleStartNewChat = () => {
    localStorage.removeItem("supportChatClosed");
    setIsSessionClosed(false);
    setIsOpen(true);
  };

const handleSendMessage = async () => {
  if (!inputValue.trim() || !supportId || isSending || isSessionClosed) return;

  const message = {
    supportId,
    bId: userInfo.email,
    bName: userInfo.name,
    text: inputValue.trim(),
    time: new Date().toISOString(),
    sender: "user",
    read: false,
  };

  setIsSending(true);

  try {
    const response = await fetch(`${base_url}/addschat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    // Do NOT socket.send here.
    // Do NOT setMessages here.
    // Backend will broadcast the saved message through WebSocket.

    setInputValue("");
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    setIsSending(false);
  }
};

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (userInfo.name.trim() && userInfo.email.trim()) {
      const emailId = userInfo.email.trim().toLowerCase();
      localStorage.removeItem("supportChatClosed");
      setIsSessionClosed(false);
      setSupportId(emailId);
      setIsFormSubmitted(true);
      localStorage.setItem("supportUser", JSON.stringify(userInfo));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && !isSessionClosed && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex  text-white p-4 rounded-full shadow-lg transition-all duration-300 items-center justify-center"
        style={{ background: "linear-gradient(160deg,#050d1f 0%,#0a1628 55%,#050d1f 100%)" }}  >
          <MessageCircle size={24} />
        </button>
      )}

      {!isOpen && isSessionClosed && (
        <button
          onClick={handleStartNewChat}
          className="hidden md:flex text-white p-4 rounded-full shadow-lg transition-all duration-300 items-center justify-center"
        style={{ background: "linear-gradient(160deg,#050d1f 0%,#0a1628 55%,#050d1f 100%)" }}  >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b  text-white"   style={{ background: "linear-gradient(160deg,#050d1f 0%,#0a1628 55%,#050d1f 100%)" }}>
            <div className="flex flex-col">
              <span className="font-semibold">Support Chat</span>
              {isFormSubmitted && (
                <span className="text-xs text-blue-100 opacity-80">{userInfo.name}</span>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-sm text-gray-200 hover:text-white">
              ✕
            </button>
          </div>

          {isFormSubmitted && (
            <div className="px-4 py-2 border-b bg-white">
              <button
                type="button"
                onClick={handleCloseChatSession}
                className="w-full  text-red-500 hover:bg-red-50  rounded-lg text-sm font-medium transition-all"
              >
                Close Session
              </button>
            </div>
          )}

          {!isFormSubmitted ? (
            <form onSubmit={handleFormSubmit} className="p-4 space-y-3">
              <p className="text-gray-600 text-sm">Please enter your name and email before starting chat:</p>
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
                className="w-full text-white py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: "linear-gradient(160deg,#050d1f 0%,#0a1628 55%,#050d1f 100%)" }}  >
                Start Chat
              </button>
            </form>
          ) : (
            <>
              <div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#93c5fd #f1f5f9", maxHeight: "60vh" }}
              >
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm pt-4">Start your conversation below</p>
                ) : (
                  (() => {
                    const lastUserMsgIndex = messages.map(m => m.sender).lastIndexOf("user");
                    return messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-3 py-2 rounded-2xl max-w-[75%] ${
                            msg.sender === "user"
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div className={`flex items-center gap-0.5 mt-0.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <span className={`text-[10px] ${msg.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                              {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        {msg.sender === "user" && i === lastUserMsgIndex && (
                          <SeenLabel read={msg.read} />
                        )}
                      </div>
                    ));
                  })()
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t flex items-center p-2">
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
                    style={{ background: "linear-gradient(160deg,#050d1f 0%,#0a1628 55%,#050d1f 100%)" }}
                  className={`px-4 py-2 rounded-r-md text-white text-sm font-medium ${
                    !inputValue.trim() || isSending ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportChat;
