
import { useLocation } from "react-router-dom";
import SupportChat from "./SupportChat";

const SupportChatWrapper = () => {
  const location = useLocation();

  const hiddenRoutes = [
    "/login",
    "/register",
    "/admin",
    "/checkout"
  ];

  const shouldHide = hiddenRoutes.includes(location.pathname);

  if (shouldHide) return null;

  return <SupportChat />;
};

export default SupportChatWrapper;