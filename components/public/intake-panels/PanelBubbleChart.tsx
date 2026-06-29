'use client'

interface PanelBubbleChartProps {
  experience: string
}

// Container translateX per experience level
// Circle is at cx=85.827 within container, needs to land at x=100/269/438
const TX: Record<string, number> = {
  '':           14.173,
  'none':       14.173,
  'some':       183.173,
  'experienced': 352.173,
}

export default function PanelBubbleChart({ experience }: PanelBubbleChartProps) {
  const tx = TX[experience] ?? TX['none']
  const showLess5 = experience === 'some'
  const showMore5 = experience === 'experienced'

  return (
    <div style={{ width: 555, height: 378, borderRadius: 24, background: 'var(--color-bg)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, right: 8, bottom: 8, left: 8, borderRadius: 20, overflow: 'hidden' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="539" height="362" fill="none" viewBox="0 0 539 362">
          <defs>
            <linearGradient id="exp-b" x1="269.5" x2="269.5" y1="167.5" y2="376.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b60f3" stopOpacity=".3" />
              <stop offset="1" stopColor="#3b60f3" stopOpacity="0" />
            </linearGradient>
            <clipPath id="exp-a">
              <rect width="539" height="362" fill="#fff" rx="16" />
            </clipPath>
            <filter id="exp-c" width="256" height="246" x="-42" y="42" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="9" />
              <feGaussianBlur stdDeviation="10" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.05 0" />
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="36" />
              <feGaussianBlur stdDeviation="18" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.04 0" />
              <feBlend in2="effect1_dropShadow" result="effect2_dropShadow" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="81" />
              <feGaussianBlur stdDeviation="24.5" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.03 0" />
              <feBlend in2="effect2_dropShadow" result="effect3_dropShadow" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="144" />
              <feGaussianBlur stdDeviation="28.5" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.01 0" />
              <feBlend in2="effect3_dropShadow" result="effect4_dropShadow" />
              <feBlend in="SourceGraphic" in2="effect4_dropShadow" result="shape" />
            </filter>
          </defs>

          <g clipPath="url(#exp-a)">
            {/* Background */}
            <rect width="539" height="362" fill="#f6f7f8" rx="16" />

            {/* Gradient fill below baseline */}
            <path fill="url(#exp-b)" stroke="#3b60f3" d="M546 167.5H-7v209h553z" />

            {/* Horizontal baseline */}
            <path stroke="#3b60f3" strokeWidth="3" d="M-1 167h540" />

            {/* Three position markers on baseline */}
            <circle cx="100" cy="167" r="10" fill="#3b60f3" />
            <circle cx="269" cy="167" r="10" fill="#3b60f3" />
            <circle cx="438" cy="167" r="10" fill="#3b60f3" />

            {/* Experience level container — slides horizontally */}
            <g style={{ transform: `translateX(${tx}px)`, transition: 'transform 0.5s ease' }}>
              {/* Shadow pill indicator */}
              <g filter="url(#exp-c)">
                <rect width="34" height="142" x="15" y="87" fill="#3b60f3" rx="17" transform="rotate(-90 15 87)" />
              </g>

              {/* Ripple circles at dot centre */}
              <g transform="translate(85.827, 166.827)">
                {/* "some" ripple — smaller */}
                <g
                  visibility={showLess5 ? 'visible' : 'hidden'}
                  style={{
                    transform: showLess5 ? 'scale(1)' : 'scale(0)',
                    transformOrigin: '0px 0px',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <circle cx="0" cy="0" r="44" fill="#ffffff5c" stroke="#3b60f3" strokeWidth="2" strokeOpacity="0.7" />
                </g>
                {/* "experienced" ripple — larger */}
                <g
                  visibility={showMore5 ? 'visible' : 'hidden'}
                  style={{
                    transform: showMore5 ? 'scale(1)' : 'scale(0)',
                    transformOrigin: '0px 0px',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <circle cx="0" cy="0" r="60" fill="#ffffff5c" stroke="#3b60f3" strokeWidth="2" strokeOpacity="0.7" />
                </g>
              </g>

              {/* White text labels above baseline — verbatim from reference */}
              <path fill="#fff" d="M34.984 75v-4.032L31.256 63.8h2.176l2.736 5.696h-.416l2.736-5.696h2.16l-3.744 7.168V75zm8.997.192q-1.153 0-2.08-.528a3.94 3.94 0 0 1-1.44-1.488q-.513-.96-.512-2.192 0-1.264.528-2.208a3.8 3.8 0 0 1 1.44-1.488 4.04 4.04 0 0 1 2.08-.544q1.152 0 2.064.544a3.7 3.7 0 0 1 1.44 1.472q.528.944.528 2.208t-.528 2.208a3.9 3.9 0 0 1-1.456 1.488q-.912.528-2.064.528m0-1.648q.575 0 1.04-.288.48-.288.768-.864t.288-1.424-.288-1.408q-.273-.576-.752-.864a1.93 1.93 0 0 0-1.04-.288q-.56 0-1.04.288t-.768.864q-.288.56-.288 1.408t.288 1.424.752.864q.48.288 1.04.288m8.6 1.648q-.977 0-1.68-.384-.689-.4-1.057-1.184-.368-.8-.368-1.968v-4.72h1.92v4.528q0 1.04.432 1.584.448.528 1.344.528.576 0 1.024-.272.465-.272.72-.784.273-.528.272-1.28v-4.304h1.92V75h-1.696l-.144-1.344q-.367.705-1.072 1.12-.687.416-1.616.416M58.923 75v-8.064h1.712l.176 1.504q.29-.528.72-.896a3.1 3.1 0 0 1 1.009-.592 3.9 3.9 0 0 1 1.296-.208v2.032h-.673q-.48 0-.912.128a1.9 1.9 0 0 0-.751.384q-.305.255-.48.72-.177.448-.177 1.136V75zm14.666.192q-1.665 0-2.88-.72a4.96 4.96 0 0 1-1.856-2.032q-.64-1.312-.64-3.024 0-1.728.64-3.024a4.93 4.93 0 0 1 1.856-2.048q1.215-.736 2.88-.736 2 0 3.264.992 1.264.975 1.6 2.768h-2.112q-.224-.944-.912-1.488t-1.856-.544q-1.056 0-1.824.496-.751.48-1.168 1.408-.4.912-.4 2.176t.4 2.176q.417.895 1.168 1.392.768.48 1.824.48 1.169 0 1.856-.496.689-.511.912-1.408h2.112q-.32 1.695-1.6 2.672-1.264.96-3.264.96m10.119 0q-1.153 0-2.08-.528a3.94 3.94 0 0 1-1.44-1.488q-.512-.96-.512-2.192 0-1.264.528-2.208a3.8 3.8 0 0 1 1.44-1.488 4.04 4.04 0 0 1 2.08-.544q1.152 0 2.064.544a3.7 3.7 0 0 1 1.44 1.472q.528.944.528 2.208t-.528 2.208a3.9 3.9 0 0 1-1.456 1.488q-.912.528-2.064.528m0-1.648q.576 0 1.04-.288.48-.288.768-.864t.288-1.424-.288-1.408q-.272-.576-.752-.864a1.93 1.93 0 0 0-1.04-.288q-.56 0-1.04.288t-.768.864q-.288.56-.288 1.408t.288 1.424.752.864q.48.288 1.04.288M89.316 75v-8.064h1.696l.16 1.104q.384-.608 1.008-.944a3 3 0 0 1 1.456-.352q.609 0 1.088.16.496.16.864.48.384.32.624.8a3.2 3.2 0 0 1 1.168-1.056 3.3 3.3 0 0 1 1.568-.384q1.008 0 1.712.416.705.4 1.072 1.2.368.784.368 1.936V75h-1.904v-4.512q0-1.024-.416-1.568t-1.232-.544q-.56 0-.992.272-.416.272-.656.8-.24.512-.24 1.264V75h-1.904v-4.512q0-1.024-.416-1.568-.415-.544-1.248-.544-.528 0-.96.272-.416.272-.656.8-.24.512-.24 1.264V75zm14.493 3.52V66.936h1.712l.208 1.168q.256-.352.608-.656.368-.32.88-.512a3.5 3.5 0 0 1 1.2-.192q1.136 0 2 .56.88.56 1.376 1.52.496.945.496 2.16t-.512 2.176a3.8 3.8 0 0 1-1.376 1.488q-.864.544-1.984.544-.912 0-1.6-.336a2.86 2.86 0 0 1-1.088-.992v4.656zm4.208-4.992a2.27 2.27 0 0 0 1.2-.32q.528-.32.816-.896.304-.576.304-1.328 0-.768-.304-1.344a2.14 2.14 0 0 0-.816-.896 2.27 2.27 0 0 0-1.2-.32q-.688 0-1.216.32a2.3 2.3 0 0 0-.816.896q-.288.576-.288 1.328 0 .768.288 1.344.305.56.816.896.528.32 1.216.32m8.504 1.664q-.993 0-1.648-.336-.657-.336-.976-.896a2.4 2.4 0 0 1-.32-1.216q0-.768.384-1.328.4-.56 1.168-.864.768-.32 1.888-.32h2.032q0-.64-.176-1.056a1.25 1.25 0 0 0-.544-.64q-.368-.208-.944-.208-.657 0-1.12.304-.465.287-.576.896h-1.888q.096-.864.576-1.472.48-.624 1.264-.96a4.3 4.3 0 0 1 1.744-.352q1.135 0 1.936.4.8.385 1.216 1.12.432.72.432 1.744V75h-1.632l-.192-1.296q-.16.32-.416.592-.24.271-.56.48-.32.192-.736.304a3.4 3.4 0 0 1-.912.112m.432-1.52q.464 0 .816-.16.368-.175.624-.48.272-.32.416-.704t.192-.816v-.032h-1.776q-.56 0-.928.144-.369.127-.528.384a1.1 1.1 0 0 0-.16.592q0 .336.16.576t.464.368.72.128M122.7 75v-8.064h1.696l.144 1.344q.367-.705 1.056-1.12t1.632-.416q.976 0 1.664.416.689.4 1.056 1.184.384.784.384 1.952V75h-1.92v-4.528q0-1.008-.448-1.552t-1.328-.544q-.576 0-1.04.272a1.95 1.95 0 0 0-.72.8q-.256.511-.256 1.248V75zm10.047 3.52 1.968-4.416h-.48l-3.216-7.168h2.096l2.4 5.472 2.272-5.472h2.032l-5.04 11.584z" />

              {/* Main blue dot */}
              <circle cx="85.827" cy="166.827" r="28.87" fill="#3b60f3" />

              {/* Vertical connector line through dot */}
              <path stroke="#3b60f3" strokeWidth="3" d="M85.957 141.5v229" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
