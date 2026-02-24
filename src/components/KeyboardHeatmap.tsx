interface Props {
  charErrors: Record<string, number>;
  totalChars: number;
}

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const ROW_OFFSETS = [0, 0.3, 0.6];

function getKeyStyle(char: string, charErrors: Record<string, number>, maxErrors: number) {
  const errors = charErrors[char] || 0;
  if (errors === 0) {
    return {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: 'var(--text-dim)',
    };
  }
  const intensity = errors / Math.max(maxErrors, 1);
  if (intensity < 0.33) {
    return {
      background: 'rgba(109,250,205,0.15)',
      border: '1px solid rgba(109,250,205,0.3)',
      color: 'var(--accent3)',
    };
  }
  if (intensity < 0.66) {
    return {
      background: 'rgba(245,200,66,0.2)',
      border: '1px solid rgba(245,200,66,0.4)',
      color: '#f5c842',
    };
  }
  return {
    background: 'rgba(250,109,143,0.25)',
    border: '1px solid rgba(250,109,143,0.5)',
    color: 'var(--accent2)',
  };
}

export default function KeyboardHeatmap({ charErrors, totalChars }: Props) {
  const maxErrors = Math.max(...Object.values(charErrors), 1);

  if (totalChars === 0) return null;

  return (
    <div className="w-full">
      <h3
        className="uppercase mb-4"
        style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: 'var(--text-dim)',
        }}
      >
        Keyboard Heatmap
      </h3>
      <div className="overflow-x-auto pb-1">
      <div className="flex flex-col gap-1.5" style={{ minWidth: 'max-content' }}>
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex gap-1.5"
            style={{ paddingLeft: `${ROW_OFFSETS[rowIdx] * 40}px` }}
          >
            {row.map(key => {
              const errors = charErrors[key] || 0;
              const style = getKeyStyle(key, charErrors, maxErrors);

              return (
                <div key={key} className="relative group">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center cursor-default transition-all duration-200"
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '10px',
                      ...style,
                    }}
                  >
                    {key}
                  </div>
                  {errors > 0 && (
                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                      style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '9px',
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      {errors} err
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* Space bar */}
        <div style={{ paddingLeft: `${ROW_OFFSETS[2] * 40 + 40 * 3 + 6}px` }}>
          <div
            className="h-8 rounded-md flex items-center justify-center"
            style={{
              width: '160px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '9px',
              ...getKeyStyle(' ', charErrors, maxErrors),
            }}
          >
            space
          </div>
        </div>
      </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4">
        <span
          style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-dim)' }}
        >
          errors:
        </span>
        {[
          { label: 'none', color: 'rgba(255,255,255,0.08)' },
          { label: 'low', color: 'rgba(109,250,205,0.4)' },
          { label: 'med', color: 'rgba(245,200,66,0.4)' },
          { label: 'high', color: 'rgba(250,109,143,0.4)' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
            <span
              style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-dim)' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
