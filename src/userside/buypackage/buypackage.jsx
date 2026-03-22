import { Link  } from 'react-router-dom';
import Navber from '../navBer/navber';
import Footer from '../footer/footer';
import { FaRegAddressBook ,FaPhoneAlt ,FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
const Buypackage = () => {
    return (
        <div className='h-screen'>
        <Navber/>
      <div> <div className='lg:w-1/2 w-full h-full flex flex-row justify-center items-center'>
            <div className='lg:w-1/2 w-auto bg-white shadow-md h-auto my-20 p-10'>
                <div className='text-4xl font-bold mb-10'>Sign Up</div>
                        <label className="input input-bordered flex items-center gap-2 mb-4">
                        <FaUser /> <input type="text" className="grow" placeholder="Enter your name" />
                </label>
                <label className="input input-bordered flex items-center gap-2 mb-4">
                <MdEmail /><input type="text" className="grow" placeholder="Enter your email" />
                </label>
                <label className="input input-bordered flex items-center gap-2 mb-4">
                <RiLockPasswordLine /> <input type="password" className="grow" placeholder="password" />
                </label>
                <label className="input input-bordered flex items-center gap-2 mb-4">
                <RiLockPasswordLine /> <input type="password" className="grow" placeholder="retype password" />
                </label>
                <label className="input input-bordered flex items-center gap-2 mb-4">
                <FaLocationDot />
                <input type="text" className="grow" placeholder="Country" />
                </label>
                <label className="input input-bordered flex items-center gap-2 mb-4">
                <FaRegAddressBook /> <input type="text" className="grow" placeholder="Address" />
                </label>
                <label className="input input-bordered flex items-center gap-2 mb-4">
              <FaPhoneAlt/>  <input type="text" className="grow" placeholder="Phone" />
                </label>
              
             

               
                <div className='text-end my-2 text-blue-500'>already have an account? <span className='text-blue-600 underline'>sign in</span></div>
                <div>
                <Link to="/requireddetails" className='btn w-full  bg-blue-500 text-white'>Sign up</Link>
                </div>
               
            </div>
        </div></div>
          <Footer/>
        </div>
    );
};

export default Buypackage;