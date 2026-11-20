type AppLogoProps = {
  size?: number;
  withWordmark?: boolean;
};

export function Logo({ size = 72, withWordmark = false }: AppLogoProps) {
  return (
    <div className='flex flex-col items-center gap-3'>
      <div
        className='flex items-center justify-center rounded-[1.4rem] bg-primary shadow-lg shadow-blue-600/25'
        style={{ width: size, height: size }}
      >
        <svg viewBox='0 0 24 24' width={size * 0.52} height={size * 0.52} fill='none' aria-hidden>
          <rect x='4' y='5' width='16' height='15' rx='2.5' stroke='white' strokeWidth='2' />
          <path d='M8 3.5v3M16 3.5v3' stroke='white' strokeWidth='2' strokeLinecap='round' />
          <path d='M4 9.5h16' stroke='white' strokeWidth='2' />
          <path
            d='M8.5 14.5 10.8 16.8 15.5 12'
            stroke='white'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>

      {withWordmark ? (
        <p className='text-2xl font-semibold tracking-tight text-foreground'>Plan It</p>
      ) : null}
    </div>
  );
}
