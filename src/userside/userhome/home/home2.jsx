import React from 'react';
import background from '/assets/back/bg1.jpeg'
const Home2 = () => {
    return (
<div className="relative flex w-screen h-screen image-full">
<figure className="flex z-5">
  <img
    className="h-screen w-screen relative object-cover"
    src={background}
    alt="Shoes"
  />
</figure>
<div className="absolute  z-6 flex items-center justify-start w-full h-full bg-black bg-opacity-20">
  <div className=" text-white text-center lg:text-start lg:p-20 p-4">
    <h2 className="text-3xl lg:text-8xl ">THE DOORWAY FOR YOUR<br/>
BUSINESS TO THE<br/>
ONLINE WORLD</h2>
    <p className='mt-2 lg:mt-10 text-xl lg:text-4xl'>Setting up businesses worldwide for 6 years with ease </p>
  </div>
</div>
</div>

    );
};

export default Home2;