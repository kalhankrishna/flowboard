import Link from 'next/link';
import { Workflow, LayoutList, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-linear-to-br from-slate-50 to-stone-100">
      <header className='sticky top-0 border-b-2 flex justify-between px-4 py-4 shadow-xs'>
        <div className='flex items-center space-x-2'>
          <span className='inline-block'><Workflow className="text-cyan-600 size-7" /></span>
          <span className='text-3xl font-bold font-heading text-gray-700'>Flowboard</span>
        </div>
        <div className='flex items-center space-x-4 pr-4'>
          <Link href="/login" className="font-semibold text-cyan-500 border-1 rounded-lg px-4 py-2 hover:text-white hover:bg-cyan-500 transition-all">Log in</Link>
          <Link href="/register" className="font-semibold text-white px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 transition-colors">Sign up</Link>
        </div>
      </header>

      <main className='md:text-center flex flex-col items-start md:items-center justify-center px-4'>
        <p className="text-sm font-sans text-cyan-600 mb-6 uppercase">Project Management, Simplified</p>
        <h1 className="text-4xl font-semibold font-heading text-gray-700 mb-10">
          Organize your workflow{" "}
          <span className="text-cyan-600">with clarity</span>
        </h1>
        <div className="mb-6 lg:max-w-1/2 text-xl font-sans text-zinc-600 text-muted-foreground leading-relaxed">
          <p>Flowboard helps teams organize, track, and manage their work seamlessly.</p>
          <p>From planning to execution, stay in flow.</p>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <Link 
            href="/dashboard"
            className="flex items-center bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition"
          >
            <span className='inline-block mr-2'><LayoutList/></span>
            Go to Dashboard
          </Link>
          
          <Link 
            href="/login"
            className="flex items-center bg-transparent border-2 text-cyan-500 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-500 hover:text-white transition"
          >
            Login
            <span className='inline-block ml-2'><LogIn/></span>
          </Link>
        </div>
      </main>

      <footer className='sticky bottom-0 border-t-2 px-4 py-4 shadow-xs'>
        <p className='text-sm text-gray-500 text-center'>&copy; {new Date().getFullYear()} Flowboard. All rights reserved.</p>
      </footer>
    </div>
  );
}