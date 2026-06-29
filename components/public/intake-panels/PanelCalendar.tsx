'use client'

interface PanelCalendarProps {
  timeline: string
}

// Cursor translateX per timeline — circle sits at SVG x=105
// offset = targetColumnCenter - 105
const CURSOR_TX: Record<string, number> = {
  '':       5.5,
  'active': 5.5,   // already making money → planning col (leftmost)
  'soon':   99.6,  // launching soon → col 3
  'future': 241.4, // future plan → col 5
}

function barFill(bar: 'planning' | 'launching' | 'active', timeline: string): string {
  const highlight: Record<string, string> = { active: 'planning', soon: 'launching', future: 'active' }
  return (highlight[timeline] ?? 'planning') === bar ? '#6e8bff' : '#d0daff'
}

export default function PanelCalendar({ timeline }: PanelCalendarProps) {
  const tx = CURSOR_TX[timeline] ?? CURSOR_TX['']
  const pFill = barFill('planning', timeline)
  const lFill = barFill('launching', timeline)
  const aFill = barFill('active', timeline)

  return (
    <div style={{ width: 555, height: 378, borderRadius: 24, background: '#ffffff', padding: 8, boxSizing: 'border-box' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="539" height="362" fill="none" viewBox="0 0 539 362">
        <g clipPath="url(#cal-a)">
          {/* Background */}
          <rect width="539" height="362" fill="#f6f7f8" rx="16"/>

          {/* Table area — clipped to white rect (y=68 onward) */}
          <g clipPath="url(#cal-b)">
            <rect width="496" height="304" x="22" y="68" fill="#fff" rx="4"/>

            {/* Header row (y=68–120) — day name glyphs + date numbers */}
            <g clipPath="url(#cal-c)">
              <path fill="#fff" fillOpacity=".01" d="M22 68h496v52H22z"/>
              {/* Col 1 */}
              <mask id="cal-d" fill="#fff"><path d="M22 68h70.857v52H22z"/></mask>
              <path fill="#fff" fillOpacity=".05" d="M22 68h70.857v52H22z"/>
              <path fill="#eaefff" d="M22 68v-1h-1v1zm0 0v1h70.857v-2H22zm0 52h1V68h-2v52z" mask="url(#cal-d)"/>
              <path fill="#b2b2b2" d="M46.329 90v-8.4h1.176l2.964 5.868 2.976-5.868h1.188V90h-1.008v-6.6l-2.772 5.424h-.756l-2.76-5.4V90zm12.49.144q-.84 0-1.512-.384a2.8 2.8 0 0 1-1.056-1.104q-.384-.72-.384-1.668 0-.972.384-1.68.396-.72 1.068-1.104a3 3 0 0 1 1.524-.396q.864 0 1.524.396.672.384 1.056 1.104.396.708.396 1.668t-.396 1.68q-.396.708-1.068 1.104-.672.384-1.536.384m.012-.864q.516 0 .96-.252.444-.264.72-.78t.276-1.272q0-.768-.276-1.272a1.8 1.8 0 0 0-.708-.768 1.8 1.8 0 0 0-.96-.264q-.504 0-.96.264a1.86 1.86 0 0 0-.72.768q-.264.504-.264 1.272 0 .756.264 1.272.276.516.708.78.444.252.96.252m4.16.72v-6.048h.913l.048 1.056q.288-.564.816-.876.54-.324 1.224-.324.708 0 1.224.288.516.276.804.852.288.564.288 1.44V90H67.3v-3.504q0-.912-.408-1.368-.396-.456-1.128-.456a1.64 1.64 0 0 0-.9.252q-.396.24-.636.708-.228.456-.228 1.14V90z"/>
              <path fill="#000" d="M57.065 106.144q-.792 0-1.356-.3a2.5 2.5 0 0 1-.9-.828 2.8 2.8 0 0 1-.396-1.152h.936q.12.672.576 1.044.456.36 1.152.36.636 0 1.128-.384t.792-1.164q.312-.792.348-2.004v-.144a2.4 2.4 0 0 1-.528.696 2.6 2.6 0 0 1-.828.516 2.8 2.8 0 0 1-1.056.192q-.708 0-1.344-.336a2.8 2.8 0 0 1-1.02-.936q-.384-.612-.384-1.428 0-.708.348-1.356t.996-1.056 1.536-.408q.9 0 1.524.348.624.336.996.912.384.564.552 1.284t.168 1.464q0 1.38-.384 2.436-.372 1.056-1.104 1.656-.72.588-1.752.588m.072-4.044q.552 0 .996-.252t.696-.684q.264-.432.264-.948 0-.552-.264-.972-.252-.42-.696-.66a2.06 2.06 0 0 0-.996-.24q-.552 0-.996.252-.432.24-.684.66t-.252.972q0 .564.252.984t.684.66q.444.228.996.228"/>
              {/* Col 2 */}
              <mask id="cal-e" fill="#fff"><path d="M92.857 68h70.858v52H92.857z"/></mask>
              <path fill="#fff" fillOpacity=".05" d="M92.857 68h70.858v52H92.857z"/>
              <path fill="#eaefff" d="M92.857 68v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 52h1V68h-2v52z" mask="url(#cal-e)"/>
              <path fill="#b2b2b2" d="M121.154 90v-7.572h-2.508V81.6h6.024v.828h-2.508V90zm6.057.144q-.696 0-1.224-.276a1.9 1.9 0 0 1-.804-.852q-.276-.576-.276-1.44v-3.624h1.008v3.516q0 .9.396 1.356t1.116.456q.504 0 .912-.24a1.7 1.7 0 0 0 .636-.708q.24-.468.24-1.14v-3.24h1.008V90h-.912l-.06-1.056a2.1 2.1 0 0 1-.816.888q-.54.312-1.224.312m7.095 0q-.852 0-1.512-.396a2.8 2.8 0 0 1-1.02-1.104q-.372-.72-.372-1.668 0-.96.36-1.668a2.75 2.75 0 0 1 1.032-1.104q.672-.396 1.536-.396.888 0 1.5.396.624.396.948 1.044.336.636.336 1.404v.252q0 .132-.012.3h-4.944v-.78h3.972q-.036-.828-.552-1.296-.504-.468-1.272-.468-.516 0-.96.24-.432.228-.696.684-.264.444-.264 1.116v.336q0 .744.264 1.248.276.504.708.756.444.252.948.252.636 0 1.044-.276.42-.288.6-.768h.996q-.144.54-.504.972t-.9.684q-.528.24-1.236.24"/>
              <path fill="#000" d="M124.11 106v-7.272l-1.44.36v-.72l1.776-.768h.684v8.4zm5.79.144q-1.104 0-1.908-.54-.792-.552-1.212-1.524-.42-.984-.42-2.28t.42-2.268q.42-.984 1.212-1.524.804-.552 1.908-.552t1.884.552q.792.54 1.212 1.524.42.972.42 2.268t-.42 2.28q-.42.972-1.212 1.524-.78.54-1.884.54m-.012-.888q.72 0 1.284-.408.564-.42.888-1.188.324-.78.324-1.86t-.324-1.848q-.324-.78-.888-1.188a2.13 2.13 0 0 0-1.284-.408q-.72 0-1.296.408-.564.408-.888 1.188-.312.768-.312 1.848t.312 1.86q.324.768.888 1.188.576.408 1.296.408"/>
              {/* Col 3 */}
              <mask id="cal-f" fill="#fff"><path d="M163.714 68h70.857v52h-70.857z"/></mask>
              <path fill="#fff" fillOpacity=".05" d="M163.714 68h70.857v52h-70.857z"/>
              <path fill="#eaefff" d="M163.714 68v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 52h1V68h-2v52z" mask="url(#cal-f)"/>
              <path fill="#b2b2b2" d="m189.271 90-2.304-8.4h1.08l1.812 7.2 2.052-7.2h1.128l2.004 7.224 1.836-7.224h1.08l-2.352 8.4h-1.152l-2.004-6.948L190.399 90zm11.627.144q-.852 0-1.512-.396a2.8 2.8 0 0 1-1.02-1.104q-.372-.72-.372-1.668 0-.96.36-1.668a2.75 2.75 0 0 1 1.032-1.104q.672-.396 1.536-.396.888 0 1.5.396.624.396.948 1.044.336.636.336 1.404v.252q0 .132-.012.3h-4.944v-.78h3.972q-.036-.828-.552-1.296-.504-.468-1.272-.468-.516 0-.96.24-.432.228-.696.684-.264.444-.264 1.116v.336q0 .744.264 1.248.276.504.708.756.444.252.948.252.636 0 1.044-.276.42-.288.6-.768h.996q-.144.54-.504.972t-.9.684q-.528.24-1.236.24m6.593 0q-.876 0-1.536-.408-.66-.42-1.02-1.14t-.36-1.632.36-1.62q.36-.72 1.02-1.128.672-.408 1.548-.408.744 0 1.296.3.564.3.864.84V81.36h1.008V90h-.912l-.084-.996q-.192.3-.492.564-.3.252-.72.42-.42.156-.972.156m.12-.876q.6 0 1.056-.288t.708-.792q.252-.516.252-1.212 0-.684-.252-1.2a1.93 1.93 0 0 0-.708-.804 1.94 1.94 0 0 0-1.056-.288q-.588 0-1.044.288t-.708.804-.252 1.2q0 .696.252 1.212.252.504.708.792t1.044.288"/>
              <path fill="#000" d="M196.967 106v-7.272l-1.44.36v-.72l1.776-.768h.684v8.4zm3.498 0v-7.272l-1.44.36v-.72l1.776-.768h.684v8.4z"/>
              {/* Col 4 */}
              <mask id="cal-g" fill="#fff"><path d="M234.571 68h70.857v52h-70.857z"/></mask>
              <path fill="#fff" fillOpacity=".05" d="M234.571 68h70.857v52h-70.857z"/>
              <path fill="#eaefff" d="M234.571 68v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 52h1V68h-2v52z" mask="url(#cal-g)"/>
              <path fill="#b2b2b2" d="M262.368 90v-7.572h-2.508V81.6h6.024v.828h-2.508V90zm4.459 0v-8.64h1.008v3.612q.3-.54.84-.852a2.4 2.4 0 0 1 1.2-.312q.696 0 1.212.288.516.276.792.852t.276 1.452V90h-.996v-3.492q0-.912-.384-1.368-.384-.468-1.116-.468-.516 0-.936.252a1.77 1.77 0 0 0-.648.72q-.24.468-.24 1.152V90zm8.858.144q-.696 0-1.224-.276a1.9 1.9 0 0 1-.804-.852q-.276-.576-.276-1.44v-3.624h1.008v3.516q0 .9.396 1.356t1.116.456q.504 0 .912-.24a1.7 1.7 0 0 0 .636-.708q.24-.468.24-1.14v-3.24h1.008V90h-.912l-.06-1.056a2.1 2.1 0 0 1-.816.888q-.54.312-1.224.312"/>
              <path fill="#000" d="M266.324 106v-7.272l-1.44.36v-.72l1.776-.768h.684v8.4zm2.442 0v-.708q.852-.672 1.62-1.356.78-.684 1.38-1.356.6-.684.936-1.332.348-.648.348-1.248a2.1 2.1 0 0 0-.156-.816 1.37 1.37 0 0 0-.504-.624q-.336-.24-.912-.24-.564 0-.936.252a1.53 1.53 0 0 0-.564.648q-.18.396-.18.876h-.972q.012-.828.348-1.416.348-.6.948-.912t1.368-.312q.756 0 1.332.288.576.276.9.828.336.552.336 1.392 0 .588-.252 1.176-.24.588-.648 1.152-.408.552-.912 1.068-.492.516-1.02.972-.516.456-.972.828h4.092v.84z"/>
              {/* Col 5 */}
              <mask id="cal-h" fill="#fff"><path d="M305.429 68h70.857v52h-70.857z"/></mask>
              <path fill="#fff" fillOpacity=".05" d="M305.429 68h70.857v52h-70.857z"/>
              <path fill="#eaefff" d="M305.429 68v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 52h1V68h-2v52z" mask="url(#cal-h)"/>
              <path fill="#b2b2b2" d="M334.757 90v-8.4h5.112v.828h-4.104v2.952h3.492v.816h-3.492V90zm6.122 0v-6.048h.912l.072 1.152q.204-.408.516-.696.324-.288.768-.444a3.2 3.2 0 0 1 1.032-.156v1.056h-.372q-.384 0-.732.108-.348.096-.624.324-.264.228-.42.624-.144.384-.144.96V90zm4.298 0v-6.048h1.008V90zm.504-7.332a.7.7 0 0 1-.504-.192.7.7 0 0 1-.192-.504q0-.3.192-.48a.7.7 0 0 1 .504-.192q.288 0 .492.192.204.18.204.48t-.204.504a.7.7 0 0 1-.492.192"/>
              <path fill="#000" d="M337.181 106v-7.272l-1.44.36v-.72l1.776-.768h.684v8.4zm5.191.144a3.6 3.6 0 0 1-1.464-.288 2.4 2.4 0 0 1-1.032-.888q-.384-.588-.408-1.464h1.02q.012.48.228.888.228.396.648.636t1.008.24.984-.228.6-.6q.204-.384.204-.852 0-.588-.288-.948a1.55 1.55 0 0 0-.756-.54 2.9 2.9 0 0 0-1.032-.18h-.624v-.852h.624q.828 0 1.296-.384t.468-1.056q0-.552-.372-.924-.36-.372-1.104-.372-.708 0-1.128.408t-.48 1.044h-1.02q.036-.684.372-1.212t.912-.816q.576-.3 1.356-.3.816 0 1.368.288t.828.768q.288.48.288 1.056 0 .432-.156.816-.156.372-.468.66a1.8 1.8 0 0 1-.792.408q.492.096.876.372.396.276.624.72t.228 1.044q0 .684-.324 1.272-.312.576-.936.936-.624.348-1.548.348"/>
              {/* Col 6 */}
              <mask id="cal-i" fill="#fff"><path d="M376.286 68h70.857v52h-70.857z"/></mask>
              <path fill="#fff" fillOpacity=".05" d="M376.286 68h70.857v52h-70.857z"/>
              <path fill="#eaefff" d="M376.286 68v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 52h1V68h-2v52z" mask="url(#cal-i)"/>
              <path fill="#b2b2b2" d="M406.291 90.144q-.924 0-1.608-.336a2.5 2.5 0 0 1-1.056-.936q-.372-.6-.372-1.392h1.056q0 .492.228.912.228.408.66.66.444.24 1.092.24.564 0 .96-.18.408-.192.612-.516a1.3 1.3 0 0 0 .216-.732q0-.492-.216-.792a1.5 1.5 0 0 0-.564-.504 4.6 4.6 0 0 0-.84-.336q-.468-.156-.984-.324-.996-.336-1.464-.84t-.468-1.308q0-.684.312-1.2a2.2 2.2 0 0 1 .912-.804q.6-.3 1.416-.3.804 0 1.392.3.6.3.936.828.336.516.336 1.2h-1.056a1.43 1.43 0 0 0-.732-1.236q-.36-.228-.912-.228a1.8 1.8 0 0 0-.816.156 1.3 1.3 0 0 0-.552.456 1.33 1.33 0 0 0-.192.732q0 .408.168.66a1.5 1.5 0 0 0 .504.432q.336.168.78.312t.984.324q.612.204 1.08.504.48.288.744.744.276.456.276 1.164 0 .6-.324 1.14-.312.528-.936.864t-1.572.336m5.953 0q-.732 0-1.224-.252a1.8 1.8 0 0 1-.732-.684q-.24-.432-.24-.936 0-.612.312-1.032.324-.432.9-.648.588-.228 1.38-.228h1.596q0-.564-.18-.936a1.2 1.2 0 0 0-.504-.576q-.324-.192-.816-.192-.576 0-.996.288t-.516.852h-1.032q.072-.648.432-1.08.372-.444.936-.672.564-.24 1.176-.24.84 0 1.392.312.564.3.84.852.276.54.276 1.284V90h-.9l-.06-1.068a2.2 2.2 0 0 1-.312.48q-.18.216-.432.384-.252.156-.576.252a2.5 2.5 0 0 1-.72.096m.156-.852q.42 0 .756-.168.348-.18.588-.48.24-.312.36-.684.132-.372.132-.78v-.036h-1.512q-.588 0-.948.144-.36.132-.516.384a1 1 0 0 0-.156.552q0 .324.144.564.156.24.444.372.3.132.708.132m6.375.708q-.54 0-.936-.168a1.23 1.23 0 0 1-.612-.564q-.204-.408-.204-1.092v-3.372h-1.056v-.852h1.056l.132-1.464h.876v1.464h1.752v.852h-1.752v3.372q0 .564.228.768.228.192.804.192h.648V90z"/>
              <path fill="#000" d="M408.039 106v-7.272l-1.44.36v-.72l1.776-.768h.684v8.4zm6.378 0v-1.8h-4.26v-.78l4.08-5.82h1.176v5.712h1.248v.888h-1.248v1.8zm-3.144-2.688h3.192v-4.596z"/>
              {/* Col 7 */}
              <mask id="cal-j" fill="#fff"><path d="M447.143 68H518v52h-70.857z"/></mask>
              <path fill="#fff" fillOpacity=".05" d="M447.143 68H518v52h-70.857z"/>
              <path fill="#eaefff" d="M447.143 68v-1h-1v1zm0 0v1H518v-2h-70.857zm0 52h1V68h-2v52z" mask="url(#cal-j)"/>
              <path fill="#b2b2b2" d="M475.647 90.144q-.924 0-1.608-.336a2.5 2.5 0 0 1-1.056-.936q-.372-.6-.372-1.392h1.056q0 .492.228.912.228.408.66.66.444.24 1.092.24.564 0 .96-.18.408-.192.612-.516a1.3 1.3 0 0 0 .216-.732q0-.492-.216-.792a1.5 1.5 0 0 0-.564-.504 4.6 4.6 0 0 0-.84-.336q-.468-.156-.984-.324-.996-.336-1.464-.84t-.468-1.308q0-.684.312-1.2a2.2 2.2 0 0 1 .912-.804q.6-.3 1.416-.3.804 0 1.392.3.6.3.936.828.336.516.336 1.2h-1.056a1.43 1.43 0 0 0-.732-1.236q-.36-.228-.912-.228a1.8 1.8 0 0 0-.816.156 1.3 1.3 0 0 0-.552.456 1.33 1.33 0 0 0-.192.732q0 .408.168.66a1.5 1.5 0 0 0 .504.432q.336.168.78.312t.984.324q.612.204 1.08.504.48.288.744.744.276.456.276 1.164 0 .6-.324 1.14-.312.528-.936.864t-1.572.336m6.181 0q-.696 0-1.224-.276a1.9 1.9 0 0 1-.804-.852q-.276-.576-.276-1.44v-3.624h1.008v3.516q0 .9.396 1.356t1.116.456q.504 0 .912-.24a1.7 1.7 0 0 0 .636-.708q.24-.468.24-1.14v-3.24h1.008V90h-.912l-.06-1.056a2.1 2.1 0 0 1-.816.888q-.54.312-1.224.312m4.443-.144v-6.048h.912l.048 1.056q.288-.564.816-.876.54-.324 1.224-.324.708 0 1.224.288.516.276.804.852.288.564.288 1.44V90h-1.008v-3.504q0-.912-.408-1.368-.396-.456-1.128-.456a1.64 1.64 0 0 0-.9.252q-.396.24-.636.708-.228.456-.228 1.14V90z"/>
              <path fill="#000" d="M478.895 106v-7.272l-1.44.36v-.72l1.776-.768h.684v8.4zm5.407.144q-.864 0-1.5-.312a2.6 2.6 0 0 1-.996-.852 2.9 2.9 0 0 1-.456-1.212h.984q.144.672.66 1.092t1.32.42q.6 0 1.02-.276.432-.276.66-.756.24-.48.24-1.068 0-.612-.24-1.08a1.75 1.75 0 0 0-.66-.72 1.8 1.8 0 0 0-.984-.264q-.684 0-1.164.3t-.72.768h-.972l.696-4.584h4.44v.876h-3.66l-.468 2.58q.3-.348.792-.564a2.8 2.8 0 0 1 1.164-.228q.624 0 1.128.216t.864.612.552.924q.204.528.204 1.152 0 .612-.204 1.152a2.9 2.9 0 0 1-.564.948 2.7 2.7 0 0 1-.912.648 3.1 3.1 0 0 1-1.224.228"/>
            </g>

            {/* Date row (y=120–156) — eaefff column left-border stripes */}
            <g clipPath="url(#cal-k)">
              <path fill="#fff" fillOpacity=".01" d="M22 120h496v36H22z"/>
              <mask id="cal-l" fill="#fff"><path d="M22 120h70.857v36H22z"/></mask><path fill="#fff" fillOpacity=".01" d="M22 120h70.857v36H22z"/><path fill="#eaefff" d="M22 120v-1h-1v1zm0 0v1h70.857v-2H22zm0 36h1v-36h-2v36z" mask="url(#cal-l)"/>
              <mask id="cal-m" fill="#fff"><path d="M92.857 120h70.858v36H92.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M92.857 120h70.858v36H92.857z"/><path fill="#eaefff" d="M92.857 120v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 36h1v-36h-2v36z" mask="url(#cal-m)"/>
              <mask id="cal-n" fill="#fff"><path d="M163.714 120h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M163.714 120h70.857v36h-70.857z"/><path fill="#eaefff" d="M163.714 120v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-n)"/>
              <mask id="cal-o" fill="#fff"><path d="M234.571 120h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M234.571 120h70.857v36h-70.857z"/><path fill="#eaefff" d="M234.571 120v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-o)"/>
              <mask id="cal-p" fill="#fff"><path d="M305.429 120h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M305.429 120h70.857v36h-70.857z"/><path fill="#eaefff" d="M305.429 120v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-p)"/>
              <mask id="cal-q" fill="#fff"><path d="M376.286 120h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M376.286 120h70.857v36h-70.857z"/><path fill="#eaefff" d="M376.286 120v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-q)"/>
              <mask id="cal-r" fill="#fff"><path d="M447.143 120H518v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M447.143 120H518v36h-70.857z"/><path fill="#eaefff" d="M447.143 120v-1h-1h1v1zm0 0v1H518v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-r)"/>
            </g>

            {/* Rows 3–8 (y=156,192,228,264,300,336) — eaefff column stripes only */}
            <g clipPath="url(#cal-s)">
              <path fill="#fff" fillOpacity=".01" d="M22 156h496v36H22z"/>
              <mask id="cal-s0" fill="#fff"><path d="M22 156h70.857v36H22z"/></mask><path fill="#fff" fillOpacity=".01" d="M22 156h70.857v36H22z"/><path fill="#eaefff" d="M22 156v-1h-1v1zm0 0v1h70.857v-2H22zm0 36h1v-36h-2v36z" mask="url(#cal-s0)"/>
              <mask id="cal-s1" fill="#fff"><path d="M92.857 156h70.858v36H92.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M92.857 156h70.858v36H92.857z"/><path fill="#eaefff" d="M92.857 156v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 36h1v-36h-2v36z" mask="url(#cal-s1)"/>
              <mask id="cal-s2" fill="#fff"><path d="M163.714 156h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M163.714 156h70.857v36h-70.857z"/><path fill="#eaefff" d="M163.714 156v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-s2)"/>
              <mask id="cal-s3" fill="#fff"><path d="M234.571 156h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M234.571 156h70.857v36h-70.857z"/><path fill="#eaefff" d="M234.571 156v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-s3)"/>
              <mask id="cal-s4" fill="#fff"><path d="M305.429 156h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M305.429 156h70.857v36h-70.857z"/><path fill="#eaefff" d="M305.429 156v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-s4)"/>
              <mask id="cal-s5" fill="#fff"><path d="M376.286 156h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M376.286 156h70.857v36h-70.857z"/><path fill="#eaefff" d="M376.286 156v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-s5)"/>
              <mask id="cal-s6" fill="#fff"><path d="M447.143 156H518v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M447.143 156H518v36h-70.857z"/><path fill="#eaefff" d="M447.143 156v-1h-1v1zm0 0v1H518v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-s6)"/>
            </g>
            <g clipPath="url(#cal-A)">
              <path fill="#fff" fillOpacity=".01" d="M22 192h496v36H22z"/>
              <mask id="cal-A0" fill="#fff"><path d="M22 192h70.857v36H22z"/></mask><path fill="#fff" fillOpacity=".01" d="M22 192h70.857v36H22z"/><path fill="#eaefff" d="M22 192v-1h-1v1zm0 0v1h70.857v-2H22zm0 36h1v-36h-2v36z" mask="url(#cal-A0)"/>
              <mask id="cal-A1" fill="#fff"><path d="M92.857 192h70.858v36H92.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M92.857 192h70.858v36H92.857z"/><path fill="#eaefff" d="M92.857 192v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 36h1v-36h-2v36z" mask="url(#cal-A1)"/>
              <mask id="cal-A2" fill="#fff"><path d="M163.714 192h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M163.714 192h70.857v36h-70.857z"/><path fill="#eaefff" d="M163.714 192v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-A2)"/>
              <mask id="cal-A3" fill="#fff"><path d="M234.571 192h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M234.571 192h70.857v36h-70.857z"/><path fill="#eaefff" d="M234.571 192v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-A3)"/>
              <mask id="cal-A4" fill="#fff"><path d="M305.429 192h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M305.429 192h70.857v36h-70.857z"/><path fill="#eaefff" d="M305.429 192v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-A4)"/>
              <mask id="cal-A5" fill="#fff"><path d="M376.286 192h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M376.286 192h70.857v36h-70.857z"/><path fill="#eaefff" d="M376.286 192v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-A5)"/>
              <mask id="cal-A6" fill="#fff"><path d="M447.143 192H518v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M447.143 192H518v36h-70.857z"/><path fill="#eaefff" d="M447.143 192v-1h-1v1zm0 0v1H518v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-A6)"/>
            </g>
            <g clipPath="url(#cal-I)">
              <path fill="#fff" fillOpacity=".01" d="M22 228h496v36H22z"/>
              <mask id="cal-I0" fill="#fff"><path d="M22 228h70.857v36H22z"/></mask><path fill="#fff" fillOpacity=".01" d="M22 228h70.857v36H22z"/><path fill="#eaefff" d="M22 228v-1h-1v1zm0 0v1h70.857v-2H22zm0 36h1v-36h-2v36z" mask="url(#cal-I0)"/>
              <mask id="cal-I1" fill="#fff"><path d="M92.857 228h70.858v36H92.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M92.857 228h70.858v36H92.857z"/><path fill="#eaefff" d="M92.857 228v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 36h1v-36h-2v36z" mask="url(#cal-I1)"/>
              <mask id="cal-I2" fill="#fff"><path d="M163.714 228h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M163.714 228h70.857v36h-70.857z"/><path fill="#eaefff" d="M163.714 228v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-I2)"/>
              <mask id="cal-I3" fill="#fff"><path d="M234.571 228h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M234.571 228h70.857v36h-70.857z"/><path fill="#eaefff" d="M234.571 228v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-I3)"/>
              <mask id="cal-I4" fill="#fff"><path d="M305.429 228h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M305.429 228h70.857v36h-70.857z"/><path fill="#eaefff" d="M305.429 228v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-I4)"/>
              <mask id="cal-I5" fill="#fff"><path d="M376.286 228h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M376.286 228h70.857v36h-70.857z"/><path fill="#eaefff" d="M376.286 228v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-I5)"/>
              <mask id="cal-I6" fill="#fff"><path d="M447.143 228H518v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M447.143 228H518v36h-70.857z"/><path fill="#eaefff" d="M447.143 228v-1h-1v1zm0 0v1H518v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-I6)"/>
            </g>
            <g clipPath="url(#cal-Q)">
              <path fill="#fff" fillOpacity=".01" d="M22 264h496v36H22z"/>
              <mask id="cal-Q0" fill="#fff"><path d="M22 264h70.857v36H22z"/></mask><path fill="#fff" fillOpacity=".01" d="M22 264h70.857v36H22z"/><path fill="#eaefff" d="M22 264v-1h-1v1zm0 0v1h70.857v-2H22zm0 36h1v-36h-2v36z" mask="url(#cal-Q0)"/>
              <mask id="cal-Q1" fill="#fff"><path d="M92.857 264h70.858v36H92.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M92.857 264h70.858v36H92.857z"/><path fill="#eaefff" d="M92.857 264v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 36h1v-36h-2v36z" mask="url(#cal-Q1)"/>
              <mask id="cal-Q2" fill="#fff"><path d="M163.714 264h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M163.714 264h70.857v36h-70.857z"/><path fill="#eaefff" d="M163.714 264v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Q2)"/>
              <mask id="cal-Q3" fill="#fff"><path d="M234.571 264h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M234.571 264h70.857v36h-70.857z"/><path fill="#eaefff" d="M234.571 264v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Q3)"/>
              <mask id="cal-Q4" fill="#fff"><path d="M305.429 264h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M305.429 264h70.857v36h-70.857z"/><path fill="#eaefff" d="M305.429 264v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Q4)"/>
              <mask id="cal-Q5" fill="#fff"><path d="M376.286 264h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M376.286 264h70.857v36h-70.857z"/><path fill="#eaefff" d="M376.286 264v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Q5)"/>
              <mask id="cal-Q6" fill="#fff"><path d="M447.143 264H518v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M447.143 264H518v36h-70.857z"/><path fill="#eaefff" d="M447.143 264v-1h-1v1zm0 0v1H518v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Q6)"/>
            </g>
            <g clipPath="url(#cal-Y)">
              <path fill="#fff" fillOpacity=".01" d="M22 300h496v36H22z"/>
              <mask id="cal-Y0" fill="#fff"><path d="M22 300h70.857v36H22z"/></mask><path fill="#fff" fillOpacity=".01" d="M22 300h70.857v36H22z"/><path fill="#eaefff" d="M22 300v-1h-1v1zm0 0v1h70.857v-2H22zm0 36h1v-36h-2v36z" mask="url(#cal-Y0)"/>
              <mask id="cal-Y1" fill="#fff"><path d="M92.857 300h70.858v36H92.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M92.857 300h70.858v36H92.857z"/><path fill="#eaefff" d="M92.857 300v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 36h1v-36h-2v36z" mask="url(#cal-Y1)"/>
              <mask id="cal-Y2" fill="#fff"><path d="M163.714 300h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M163.714 300h70.857v36h-70.857z"/><path fill="#eaefff" d="M163.714 300v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Y2)"/>
              <mask id="cal-Y3" fill="#fff"><path d="M234.571 300h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M234.571 300h70.857v36h-70.857z"/><path fill="#eaefff" d="M234.571 300v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Y3)"/>
              <mask id="cal-Y4" fill="#fff"><path d="M305.429 300h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M305.429 300h70.857v36h-70.857z"/><path fill="#eaefff" d="M305.429 300v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Y4)"/>
              <mask id="cal-Y5" fill="#fff"><path d="M376.286 300h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M376.286 300h70.857v36h-70.857z"/><path fill="#eaefff" d="M376.286 300v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Y5)"/>
              <mask id="cal-Y6" fill="#fff"><path d="M447.143 300H518v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M447.143 300H518v36h-70.857z"/><path fill="#eaefff" d="M447.143 300v-1h-1v1zm0 0v1H518v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-Y6)"/>
            </g>
            <g clipPath="url(#cal-ag)">
              <path fill="#fff" fillOpacity=".01" d="M22 336h496v36H22z"/>
              <mask id="cal-ag0" fill="#fff"><path d="M22 336h70.857v36H22z"/></mask><path fill="#fff" fillOpacity=".01" d="M22 336h70.857v36H22z"/><path fill="#eaefff" d="M22 336v-1h-1v1zm0 0v1h70.857v-2H22zm0 36h1v-36h-2v36z" mask="url(#cal-ag0)"/>
              <mask id="cal-ag1" fill="#fff"><path d="M92.857 336h70.858v36H92.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M92.857 336h70.858v36H92.857z"/><path fill="#eaefff" d="M92.857 336v-1h-1v1zm0 0v1h70.858v-2H92.857zm0 36h1v-36h-2v36z" mask="url(#cal-ag1)"/>
              <mask id="cal-ag2" fill="#fff"><path d="M163.714 336h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M163.714 336h70.857v36h-70.857z"/><path fill="#eaefff" d="M163.714 336v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-ag2)"/>
              <mask id="cal-ag3" fill="#fff"><path d="M234.571 336h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M234.571 336h70.857v36h-70.857z"/><path fill="#eaefff" d="M234.571 336v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-ag3)"/>
              <mask id="cal-ag4" fill="#fff"><path d="M305.429 336h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M305.429 336h70.857v36h-70.857z"/><path fill="#eaefff" d="M305.429 336v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-ag4)"/>
              <mask id="cal-ag5" fill="#fff"><path d="M376.286 336h70.857v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M376.286 336h70.857v36h-70.857z"/><path fill="#eaefff" d="M376.286 336v-1h-1v1zm0 0v1h70.857v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-ag5)"/>
              <mask id="cal-ag6" fill="#fff"><path d="M447.143 336H518v36h-70.857z"/></mask><path fill="#fff" fillOpacity=".01" d="M447.143 336H518v36h-70.857z"/><path fill="#eaefff" d="M447.143 336v-1h-1v1zm0 0v1H518v-2h-70.857zm0 36h1v-36h-2v36z" mask="url(#cal-ag6)"/>
            </g>
          </g>{/* end clipPath cal-b */}

          {/* Table border — outside cal-b so it draws over the grid */}
          <rect width="495" height="303" x="22.5" y="68.5" stroke="#eaefff" rx="3.5"/>

          {/* Timeline bars — outside cal-b, drawn over grid */}
          <rect width="153" height="19" x="34" y="165" fill={pFill} rx="4" style={{ transition: 'fill 0.4s ease' }}/>
          <path fill="#fff" d="M43.75 178v-7h.84l3.73 5.61V171h.84v7h-.84l-3.73-5.61V178zm8.914.12q-.7 0-1.26-.32a2.34 2.34 0 0 1-.88-.92q-.32-.6-.32-1.39 0-.81.32-1.4.33-.6.89-.92.57-.33 1.27-.33.72 0 1.27.33.56.32.88.92.33.59.33 1.39t-.33 1.4q-.33.59-.89.92-.56.32-1.28.32m.01-.72q.43 0 .8-.21.37-.22.6-.65t.23-1.06q0-.64-.23-1.06a1.5 1.5 0 0 0-.59-.64 1.57 1.57 0 0 0-2.2.64q-.22.42-.22 1.06 0 .63.22 1.06.23.43.59.65.37.21.8.21m4.302.6-1.48-5.04h.84l1.15 4.25h-.15l1.25-4.25h.95l1.27 4.24-.16.01 1.14-4.25h.85l-1.47 5.04h-.86l-1.32-4.44h.17l-1.32 4.44z"/>
          <rect width="153" height="19" x="188" y="201" fill={lFill} rx="4" style={{ transition: 'fill 0.4s ease' }}/>
          <path fill="#fff" d="M195.75 214v-7h.84v6.33h3.26v.67zm6.663.12q-.609 0-1.02-.21a1.5 1.5 0 0 1-.61-.57q-.2-.36-.2-.78 0-.51.26-.86.27-.36.75-.54.49-.19 1.15-.19h1.33q0-.47-.15-.78a1 1 0 0 0-.42-.48q-.27-.16-.68-.16-.48 0-.83.24t-.43.71h-.86q.06-.54.36-.9.31-.37.78-.56.47-.2.98-.2.7 0 1.16.26.47.25.7.71.23.45.23 1.07V214h-.75l-.05-.89q-.1.21-.26.4-.15.18-.36.32-.21.13-.48.21-.26.08-.6.08m.13-.71q.351 0 .63-.14.29-.15.49-.4.201-.26.3-.57.11-.31.11-.65v-.03h-1.26q-.49 0-.79.12-.3.11-.43.32a.83.83 0 0 0-.13.46q0 .27.12.47.13.2.37.31.25.11.59.11m5.313.59q-.45 0-.78-.14t-.51-.47q-.17-.34-.17-.91v-2.81h-.88v-.71h.88l.11-1.22h.73v1.22h1.46v.71h-1.46v2.81q0 .47.19.64.19.16.67.16h.54v.72zm3.809.12q-.71 0-1.26-.33a2.3 2.3 0 0 1-.85-.92q-.31-.6-.31-1.39 0-.8.3-1.39a2.3 2.3 0 0 1 .86-.92q.56-.33 1.28-.33.74 0 1.25.33.52.33.79.87.28.53.28 1.17v.21q0 .11-.01.25h-4.12v-.65h3.31q-.03-.69-.46-1.08-.42-.39-1.06-.39-.43 0-.8.2a1.45 1.45 0 0 0-.58.57q-.22.37-.22.93v.28q0 .62.22 1.04.23.42.59.63.37.21.79.21.531 0 .87-.23.35-.24.5-.64h.83q-.12.45-.42.81t-.75.57a2.5 2.5 0 0 1-1.03.2m3.274-.12v-5.04h.76l.06.96q.17-.34.43-.58a1.9 1.9 0 0 1 .64-.37q.38-.13.86-.13v.88h-.31q-.32 0-.61.09a1.4 1.4 0 0 0-.52.27q-.22.19-.35.52-.12.32-.12.8v2.6z"/>
          <rect width="153" height="19" x="340" y="274" fill={aFill} rx="4" style={{ transition: 'fill 0.4s ease' }}/>
          <path fill="#fff" d="M346.75 287v-7h4.26v.69h-3.42v2.46h2.91v.68h-2.91V287zm6.932.12q-.58 0-1.02-.23a1.57 1.57 0 0 1-.67-.71q-.23-.48-.23-1.2v-3.02h.84v2.93q0 .75.33 1.13t.93.38q.42 0 .76-.2.34-.21.53-.59.2-.39.2-.95v-2.7h.84V287h-.76l-.05-.88q-.23.47-.68.74-.45.26-1.02.26m5.682-.12q-.45 0-.78-.14t-.51-.47q-.17-.34-.17-.91v-2.81h-.88v-.71h.88l.11-1.22h.73v1.22h1.46v.71h-1.46v2.81q0 .47.19.64.19.16.67.16h.54v.72zm3.566.12q-.58 0-1.02-.23a1.57 1.57 0 0 1-.67-.71q-.23-.48-.23-1.2v-3.02h.84v2.93q0 .75.33 1.13t.93.38q.42 0 .76-.2.34-.21.53-.59.2-.39.2-.95v-2.7h.84V287h-.76l-.05-.88q-.23.47-.68.74-.45.26-1.02.26m3.702-.12v-5.04h.76l.06.96q.17-.34.43-.58.27-.24.64-.37.38-.13.86-.13v.88h-.31q-.32 0-.61.09a1.4 1.4 0 0 0-.52.27q-.22.19-.35.52-.12.32-.12.8v2.6zm5.526.12q-.71 0-1.26-.33a2.3 2.3 0 0 1-.85-.92q-.31-.6-.31-1.39 0-.8.3-1.39.31-.59.86-.92.56-.33 1.28-.33.74 0 1.25.33.52.33.79.87.28.53.28 1.17v.21q0 .11-.01.25h-4.12v-.65h3.31q-.03-.69-.46-1.08-.42-.39-1.06-.39a1.66 1.66 0 0 0-.8.2 1.45 1.45 0 0 0-.58.57q-.22.37-.22.93v.28q0 .62.22 1.04.23.42.59.63.37.21.79.21.53 0 .87-.23.35-.24.5-.64h.83q-.12.45-.42.81t-.75.57q-.44.2-1.03.2"/>

          {/* Today cursor — badge + vertical line + dot, animates X based on timeline */}
          <g style={{ transform: `translateX(${tx}px)`, transition: 'transform 0.5s ease' }}>
            <path stroke="#6e8bff" d="M105 61v323"/>
            <rect width="47" height="19" x="81" y="35" fill="#6e8bff" rx="4"/>
            <circle cx="105" cy="60" r="2" fill="#6e8bff"/>
          </g>
        </g>{/* end clipPath cal-a */}

        <defs>
          <clipPath id="cal-a"><rect width="539" height="362" fill="#fff" rx="16"/></clipPath>
          <clipPath id="cal-b"><rect width="496" height="304" x="22" y="68" fill="#fff" rx="4"/></clipPath>
          <clipPath id="cal-c"><path fill="#fff" d="M22 68h496v52H22z"/></clipPath>
          <clipPath id="cal-k"><path fill="#fff" d="M22 120h496v36H22z"/></clipPath>
          <clipPath id="cal-s"><path fill="#fff" d="M22 156h496v36H22z"/></clipPath>
          <clipPath id="cal-A"><path fill="#fff" d="M22 192h496v36H22z"/></clipPath>
          <clipPath id="cal-I"><path fill="#fff" d="M22 228h496v36H22z"/></clipPath>
          <clipPath id="cal-Q"><path fill="#fff" d="M22 264h496v36H22z"/></clipPath>
          <clipPath id="cal-Y"><path fill="#fff" d="M22 300h496v36H22z"/></clipPath>
          <clipPath id="cal-ag"><path fill="#fff" d="M22 336h496v36H22z"/></clipPath>
        </defs>
      </svg>
    </div>
  )
}
