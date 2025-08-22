"use client";
import { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import NeonBackground from '../ui_components/primaryBackground/page';
import s from './button.module.css';
 
export default function RegisterPage() {
   
  return (
    <div>
      <NeonBackground />
     {  /* left */}
     <div className='relative  bg-black  shadow-[0_0_20px_rgba(59,130,246)]    m-5 ml-5  rounded-r-[250px] rounded-l-[20px] w-[40%]  h-screen  '>
      <div className='absolute bg-[url("/agent.jpg")] rounded-r-[250px] bg-cover bg-center h-full w-full opacity-20 '>
      </div>
        <div className='absolute flex flex-col   transparent items-center  h-full w-full justify-center  text-center   uppercase text-white tracking-[0.2rem] font-medium py-8 text-[12px] '>
        <h1 className='text-2xl font-bold mb-4'>Welcome Back</h1>
        <h1 className='text-[15px]  font-bold  '>Enter your personal details to use all of our features</h1>
         <div className=" w-1/2 mt-4 text-center text-[20px]  font-bold transparent p-2  border-solid  border-[1px] border-white  text-white uppercase tracking-[0.5rem]  shadow-[0_0_10px_rgba(59,130,246)] shadow-sky-500   hover:bg-white hover:text-black hover:cursor-pointer hover:shadow-[0_0_50px_rgba(59,130,246)] rounded-[5px]  transition ">
            <button>SIGN IN</button>
          </div>
         </div>
      </div>
     </div>
  );
}