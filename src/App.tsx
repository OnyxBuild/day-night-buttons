import { useState } from 'react'
import { DayNightToggle } from './components/DayNightToggle'

export default function App() {
  const [isNight, setIsNight] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  return (
    <main className="page" data-night={isNight}>
      <DayNightToggle checked={isNight} onChange={setIsNight} />
      <p className="label">{isNight ? 'Nuit' : 'Jour'}</p>
    </main>
  )
}
