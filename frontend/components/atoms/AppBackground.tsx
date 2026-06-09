export default function AppBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f6eadf]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(194,110,78,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(129,141,104,0.18),_transparent_30%),linear-gradient(135deg,_rgba(246,234,223,0.88),_rgba(239,214,195,0.72))]" />
      <div className="absolute left-0 right-0 top-1/2 h-56 -translate-y-1/2 opacity-45">
        <div className="h-full w-[180%] -translate-x-1/4 animate-pulse rounded-[50%] border-y border-[#8f6f5f]/25 [background:repeating-radial-gradient(ellipse_at_center,transparent_0_18px,rgba(143,111,95,0.18)_19px_20px)]" />
      </div>

      <div className="absolute left-[8%] top-[18%] size-16 animate-bounce rounded-full border border-[#9f5f45]/25 bg-[#fff8f0]/55 [animation-duration:5s]" />
      <div className="absolute bottom-[14%] left-[12%] size-12 rotate-12 animate-pulse rounded-xl bg-[#d9a27f]/70 shadow-lg" />
      <div className="absolute right-[9%] top-[16%] h-12 w-28 -rotate-12 animate-pulse bg-[#9faf88]/70 shadow-lg [clip-path:polygon(0_0,100%_35%,20%_100%)]" />
      <div className="absolute bottom-[18%] right-[13%] size-20 animate-bounce rounded-full border-[14px] border-[#c98763]/45 [animation-duration:6s]" />
      <div className="absolute right-[24%] top-[34%] size-8 animate-spin rounded-lg border border-[#8f6f5f]/20 [animation-duration:12s]" />
    </div>
  );
}
