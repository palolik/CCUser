import logo from '/assets/logo.png';
import { AiOutlineMenu } from 'react-icons/ai';
import { NavLink, useNavigate } from 'react-router-dom';
import './navber.css';
import { useContext ,useState} from 'react';
import { AuthContext } from './../Provider/AuthProvider';
import PhoneSupportChat from '../userhome/supportchat/PhoneSupportChat';
const Navber = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
   const [phoneChatOpen, setPhoneChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const profileLink =
    user?.role === 'client'
      ? `/clientprofile/${user?.userId}`
      : user?.role === 'emp'
      ? `/employeeprofile/${user?.userId}`
      : user?.role === 'marketer'
      ? `/marketerprofile/${user?.userId}`
      : null;

  const navLinkClass = ({ isActive }) =>
    `whitespace-nowrap hover:text-blue-600 transition-colors duration-200 ${
      isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm ">
      <div className="w-full px-4 lg:px-6 h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex-shrink-0">
          <NavLink to="/" className={navLinkClass}> <img className="w-24 lg:w-40 m-1" src={logo} alt="Logo" />
</NavLink>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-end min-w-0">
          <ul className="flex items-center gap-6 text-[15px] font-medium flex-shrink-0">
            <li><NavLink to="/aboutus" className={navLinkClass}>About Us</NavLink></li>
            <li><NavLink to="/ourteam" className={navLinkClass}>Our Team</NavLink></li>
            <li><NavLink to="/career" className={navLinkClass}>Career</NavLink></li>
            <li><NavLink to="/portfolio" className={navLinkClass}>Portfolio</NavLink></li>
          </ul>

          {/* Auth Section */}
          <div className="flex-shrink-0 flex items-center gap-3 pl-2 border-l border-gray-200">
            {user ? (
              <>
                <img
                  className="h-9 w-9 rounded-full border-2 border-blue-100 object-cover shadow-sm flex-shrink-0"
                  src={user?.rppic || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'}
                  alt="Profile"
                />
                {profileLink && (
                  <NavLink
                    to={profileLink}
                    className="text-gray-800 font-medium hover:text-blue-600 transition-colors max-w-[120px] truncate text-sm"
                    title={user?.rname}
                  >
                    {user?.rname}
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap"
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink
                to="/signin"
                className=" text-white hover:text-white text-sm px-5 py-2 rounded-xl hover:scale-105 transition-all duration-200 whitespace-nowrap font-medium shadow-sm"
            style={{
    background:
      "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)",
  }}  >
                Sign In
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile Drawer */}
        <div className="lg:hidden drawer drawer-end justify-end">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

          <div className="drawer-content">
            <label
              htmlFor="my-drawer-4"
              className="drawer-button btn btn-ghost text-2xl text-gray-700 hover:text-blue-600"
            >
              <AiOutlineMenu />
            </label>
          </div>

          <div className="drawer-side z-50">

            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay" />

            <div className="w-64 min-h-full bg-white shadow-xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-100">
                <img className="w-28" src={logo} alt="Logo" />
              </div>

              <ul className="flex flex-col p-4 gap-1 flex-1">
                {[
               
                  { to: '/aboutus', label: 'About Us' },
                  { to: '/ourteam', label: 'Our Team' },
                  { to: '/career', label: 'Career' },
                  { to: '/portfolio', label: 'Portfolio' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `block py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  </li>
                  
                ))}
                <li>
  <button
    onClick={() => setPhoneChatOpen(true)}
    className="block w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-blue-50 text-blue-700 text-left"
  >
   Support Chat
  </button>
</li>

              </ul>

              {/* Drawer Footer Auth */}
              <div className="p-4 border-t border-gray-100">
                {user ? (
                  <div className="flex items-center gap-3">
                    <img
                      className="h-10 w-10 rounded-full border-2 border-blue-100 object-cover shadow-sm flex-shrink-0"
                      src={user?.rppic || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'}
                      alt="Profile"
                    />
                    <div className="flex flex-col min-w-0">
                      {profileLink && (
                        <NavLink
                          to={profileLink}
                          className="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-sm truncate"
                          title={user?.rname}
                        >
                          {user?.rname}
                        </NavLink>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-600 text-xs font-medium transition-all mt-0.5 text-left"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to="/signin"
                    className="block text-center bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
                  >
                    Sign In
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
              {phoneChatOpen && <PhoneSupportChat onClose={() => setPhoneChatOpen(false)} />}

    </nav>
  );
};

export default Navber;