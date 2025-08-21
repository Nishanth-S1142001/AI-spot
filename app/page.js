"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NeonBackground from "./ui_components/primaryBackground/page";
import myVideo from "../public/robot.mp4";
import myVideo2 from "../public/robot2.mp4";
import { VideoOff } from "lucide-react";

export default function Home() {
 
  
   const router= useRouter();
  const handClick = () => {
  router.push("/register");}
  return (
 
   <div>
    <NeonBackground />
   <div className="relative flex items-center justify-center flex-col p-6 h-screen scroll-smooth">
      
   {/* Background video */}
  <video
    src={myVideo2}
    autoPlay
    muted
    loop
    className="absolute top-0 left-0 w-full h-full object-cover   opacity-40  "
  />
           
    <div className="z-10 flex  items-center justify-center flex-col uppercase text-white tracking-[1.5rem] font-medium py-8 text-2xl " >  
  <h1 className="m-2">build your</h1>  
  <h1 className="m-2">no code AI agents</h1> 
  <h1 className="mt-2 mb-5" >now</h1> 
  <div className={styles.buttons}>
            <button>build now</button>
            <button onClick={handClick}>sign up </button>
        </div>
      </div>
         
     {/*<main className={styles.main}>
            <div className={styles.contents}>
                <h1>deep blue cinematics</h1>
                <div className={styles.buttons}>
                    <button>our work</button>
                    <button>our story</button>
                </div>
            </div>
            <video
                src={require("../../public/video.mp4")}
                autoPlay
                muted
                loop
                className={styles.video}
            />
        </main> */}
        </div>
        </div>
         
  );
}