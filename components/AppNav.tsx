import Link from 'next/link'
import styles from './AppNav.module.css'

interface AppNavProps {
  backHref: string
  backLabel: string
  title: string
}

export function AppNav({ backHref, backLabel, title }: AppNavProps) {
  return (
    <nav className={styles.nav}>
      <Link href={backHref} className={styles.back}>
        ← {backLabel}
      </Link>
      <span className={styles.title}>{title}</span>
    </nav>
  )
}
