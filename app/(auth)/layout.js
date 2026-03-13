import { MessageSquare } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="h-screen overflow-hidden flex" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Left side - Horror Branding */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-3)', borderRight: '1px solid var(--border-2)' }}
      >
        {/* Atmospheric glow */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse at 60% 40%, rgba(185,28,28,0.18) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Decorative large faded logo */}
        <div
          className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 z-0"
          style={{ opacity: 0.04 }}
        >
          <MessageSquare style={{ width: 400, height: 400, color: 'var(--accent)' }} />
        </div>

        <div className="relative z-10 text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-8"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 0 50px var(--accent-glow), 0 0 120px rgba(185,28,28,0.1)'
            }}
          >
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-4xl font-extrabold tracking-widest uppercase mb-4"
            style={{ color: 'var(--text)', letterSpacing: '0.2em' }}
          >
            DudeChat
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }} className="text-sm">
            Real-time. Uninterrupted. Minimalist.<br />Connect in the dark.
          </p>

          {/* Subtle horizontal rule */}
          <div
            className="mt-8 mx-auto w-12 h-px"
            style={{ background: 'var(--accent)', opacity: 0.6 }}
          />
        </div>
      </div>

      {/* Right side - Form */}
      <div
        className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 overflow-y-auto"
        style={{ background: 'var(--bg)' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--accent)', boxShadow: '0 0 30px var(--accent-glow)' }}
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-widest uppercase" style={{ color: 'var(--text)' }}>
              DudeChat
            </h1>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border-2)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
