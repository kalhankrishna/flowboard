export default function Footer() {
    return (
        <footer className='sticky bottom-0 z-500 bg-linear-to-br from-slate-50 to-stone-100 border-t-2 px-4 py-4 shadow-xs'>
            <p className='text-sm text-gray-500 text-center'>&copy; {new Date().getFullYear()} Flowboard. All rights reserved.</p>
        </footer>
    );
}