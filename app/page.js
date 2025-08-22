"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NeonBackground from "./ui_components/primaryBackground/page";
import myVideo2 from "../public/robot2.mp4";

// Importing icons for the new sections
import { Bot, Code, Cloud, Quote, Twitter, Linkedin, Github } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const handClick = () => {
    router.push("/register");
  };

  return (
    <div>
      <NeonBackground />

      {/* 1. Header / Menu */}
      <header className="fixed top-0 left-0 w-full bg-black bg-opacity-30 backdrop-blur-sm z-50 transition-all">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">AI Agents Inc.</h1>
          <ul className="flex items-center space-x-8 text-white">
            <li><Link href="#about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
            <li><Link href="#services" className="hover:text-cyan-400 transition-colors">Services</Link></li>
            <li><Link href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
            <li><Link href="#contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
          </ul>
        </nav>
      </header>


      {/* Hero Section (Your original content) */}
      <div id="home" className="relative flex items-center justify-center flex-col p-6 h-screen scroll-smooth">
        {/* Background video */}
        <video
          src={myVideo2}
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
        />
        <div className="z-10 flex items-center justify-center flex-col uppercase text-white tracking-[1.5rem] font-medium py-8 text-2xl text-center">
          <h1 className="m-2">build your</h1>
          <h1 className="m-2">no code AI agents</h1>
          <h1 className="mt-2 mb-5">now</h1>
          <div className={styles.buttons}>
            <button>build now</button>
            <button onClick={handClick}>sign up</button>
          </div>
        </div>
      </div>

      {/* Main content container for all sections */}
      <main className="bg-gray-900 bg-opacity-80 text-white relative z-10">

        {/* 2. About Us Section */}
        <section id="about" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6 tracking-wider uppercase">About Us</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              We are pioneers in the no-code AI revolution. Our mission is to empower creators, entrepreneurs, and businesses of all sizes to build powerful, autonomous AI agents without writing a single line of code. We believe the future of automation is accessible to everyone.
            </p>
          </div>
        </section>

        {/* 3. Services Provided Section */}
        <section id="services" className="py-20 px-4 bg-black bg-opacity-20">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-4xl font-bold mb-12 tracking-wider uppercase">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Service Card 1 */}
              <div className="bg-gray-800 p-8 rounded-lg border border-cyan-500/20 hover:border-cyan-500 transition-all transform hover:-translate-y-2">
                <Bot size={48} className="mx-auto mb-4 text-cyan-400" />
                <h3 className="text-2xl font-semibold mb-2">Custom AI Agent Builder</h3>
                <p className="text-gray-400">An intuitive drag-and-drop interface to design, train, and deploy AI agents for any task.</p>
              </div>
              {/* Service Card 2 */}
              <div className="bg-gray-800 p-8 rounded-lg border border-cyan-500/20 hover:border-cyan-500 transition-all transform hover:-translate-y-2">
                <Code size={48} className="mx-auto mb-4 text-cyan-400" />
                <h3 className="text-2xl font-semibold mb-2">API Integration</h3>
                <p className="text-gray-400">Seamlessly connect your AI agents to thousands of third-party apps and services.</p>
              </div>
              {/* Service Card 3 */}
              <div className="bg-gray-800 p-8 rounded-lg border border-cyan-500/20 hover:border-cyan-500 transition-all transform hover:-translate-y-2">
                <Cloud size={48} className="mx-auto mb-4 text-cyan-400" />
                <h3 className="text-2xl font-semibold mb-2">Cloud Deployment</h3>
                <p className="text-gray-400">One-click deployment to our secure and scalable cloud infrastructure.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Testimonials Section */}
        <section id="testimonials" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-12 tracking-wider uppercase">What Our Clients Say</h2>
            <div className="space-y-8">
              {/* Testimonial 1 */}
              <div className="bg-gray-800 p-6 rounded-lg text-left relative">
                <Quote size={40} className="absolute top-4 left-4 text-cyan-600 opacity-20" />
                <blockquote className="text-lg italic text-gray-300">
                  "This platform changed the game for our startup. We automated 80% of our customer support in a week without hiring a developer. Incredible!"
                </blockquote>
                <cite className="block text-right mt-4 not-italic font-semibold text-cyan-400">- Jane Doe, CEO of Tech Innovators</cite>
              </div>
               {/* Testimonial 2 */}
              <div className="bg-gray-800 p-6 rounded-lg text-left relative">
                <Quote size={40} className="absolute top-4 left-4 text-cyan-600 opacity-20" />
                <blockquote className="text-lg italic text-gray-300">
                  "The flexibility of the agent builder is unmatched. I was able to create a complex marketing automation agent that now saves me 10 hours a week."
                </blockquote>
                <cite className="block text-right mt-4 not-italic font-semibold text-cyan-400">- John Smith, Marketing Freelancer</cite>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Pricing Section */}
        <section id="pricing" className="py-20 px-4 bg-black bg-opacity-20">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-4xl font-bold mb-12 tracking-wider uppercase">Pricing Plans</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Plan 1: Starter */}
              <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">Starter</h3>
                <p className="text-5xl font-bold mb-4">$49<span className="text-lg font-normal text-gray-400">/mo</span></p>
                <ul className="text-gray-300 space-y-2 text-left mb-8 flex-grow">
                  <li>✔ 1 AI Agent</li>
                  <li>✔ 10,000 Operations/mo</li>
                  <li>✔ Basic API Integrations</li>
                  <li>✔ Email Support</li>
                </ul>
                <button className="mt-auto w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">Choose Plan</button>
              </div>
              {/* Plan 2: Pro (Highlighted) */}
              <div className="bg-gray-800 p-8 rounded-lg border-2 border-cyan-500 flex flex-col relative">
                <span className="absolute top-0 -translate-y-1/2 bg-cyan-500 text-black font-bold px-3 py-1 rounded-full text-sm">MOST POPULAR</span>
                <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                <p className="text-5xl font-bold mb-4 text-cyan-400">$99<span className="text-lg font-normal text-gray-400">/mo</span></p>
                <ul className="text-gray-300 space-y-2 text-left mb-8 flex-grow">
                  <li>✔ 10 AI Agents</li>
                  <li>✔ 100,000 Operations/mo</li>
                  <li>✔ Advanced API Integrations</li>
                  <li>✔ Priority Email Support</li>
                </ul>
                <button className="mt-auto w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded transition-colors">Choose Plan</button>
              </div>
              {/* Plan 3: Enterprise */}
              <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                <p className="text-4xl font-bold mb-4">Custom</p>
                <ul className="text-gray-300 space-y-2 text-left mb-8 flex-grow">
                  <li>✔ Unlimited Agents</li>
                  <li>✔ Unlimited Operations</li>
                  <li>✔ Custom Integrations</li>
                  <li>✔ 24/7 Dedicated Support</li>
                </ul>
                <button className="mt-auto w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">Contact Us</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Contact Us / Footer Section */}
      <footer id="contact" className="bg-black py-10 px-4 text-center text-gray-400 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Get In Touch</h2>
          <p className="mb-6">Have questions? We'd love to hear from you.</p>
          <p className="text-cyan-400 text-lg mb-8">contact@aiagentsinc.com</p>
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="hover:text-white transition-colors"><Twitter size={28} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={28} /></a>
            <a href="#" className="hover:text-white transition-colors"><Github size={28} /></a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} AI Agents Inc. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}