import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { base_url } from "../../../config/config";
import { chat_url } from "../../../config/config";

const SupportChat = ({ forceOpen = false }) => {
  const [isOpen, setIsOpen] = useState(false);

 
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [supportId, setSupportId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    
    const authRaw = localStorage.getItem("authUser");
    if (authRaw) {
      try {
        const authUser = JSON.parse(authRaw);
        if (authUser?.email && authUser?.rname) {
          const user = { name: authUser.rname, email: authUser.email };
          setUserInfo(user);
          setSupportId(authUser.email.trim().toLowerCase());
          setIsFormSubmitted(true);
          return; // skip guest check
        }
      } catch (e) {
        console.error("Failed to parse authuser:", e);
      }
    }

    // Priority 2: previously saved guest user
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
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);
  const fetchMessages = async () => {
    if (!supportId) return;
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
    if (!supportId) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);

    if (socket) socket.close();
    const newSocket = new WebSocket(`${chat_url}?supportId=${supportId}`);

    newSocket.onopen = () => console.log("Support chat WebSocket connected");
    newSocket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prev) => {
        if (
          !prev.some(
            (msg) =>
              msg.time === newMessage.time && msg.text === newMessage.text
          )
        ) {
          return [...prev, newMessage];
        }
        return prev;
      });
    };
    newSocket.onclose = () => console.log("Support chat WebSocket closed");

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
    };

    setIsSending(true);
    try {
      await fetch(`${base_url}/addschat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }

      setMessages((prev) => [...prev, message]);
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
      setSupportId(emailId);
      setIsFormSubmitted(true);
      localStorage.setItem("supportUser", JSON.stringify(userInfo));
    }
  };

  return (
 <div className="fixed bottom-6 right-6 z-50">
      {/* Hide floating button on mobile */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b bg-blue-600 text-white">
            <div className="flex flex-col">
              <span className="font-semibold">Support Chat</span>
              {isFormSubmitted && (
                <span className="text-xs text-blue-100 opacity-80">
                  {userInfo.name}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-200 hover:text-white"
            >
              ✕
            </button>
          </div>

          {!isFormSubmitted ? (
            <form onSubmit={handleFormSubmit} className="p-4 space-y-3">
              <p className="text-gray-600 text-sm">
                Please enter your details before starting chat:
              </p>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={userInfo.name}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={userInfo.email}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, email: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-all"
              >
                Start Chat
              </button>
            </form>
          ) : (
            <>
              <div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#93c5fd #f1f5f9",
                  maxHeight: "60vh",
                }}
              >
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">
                    Start your conversation below 👋
                  </p>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`chat ${
                        msg.sender === "user" ? "chat-end" : "chat-start"
                      }`}
                    >
                      <div className="chat-header flex flex-row items-center">
                        <p className="font-medium text-sm">
                          {msg.sender === "user"
                            ? userInfo.name
                            : "Support Team"}
                        </p>
                        <time className="text-xs opacity-50 ml-1">
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
                    </div>
                  ))
                )}
              </div>

              <div className="border-t flex items-center p-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-l-md focus:outline-none focus:ring-0"
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