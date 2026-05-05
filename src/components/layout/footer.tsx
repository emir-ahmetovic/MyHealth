import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-slate-900">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white">MZ</div>
              <span className="text-xl font-semibold">MojeZdravlje</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Povezujemo pacijente sa privatnim klinikama širom Bosne i Hercegovine.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Linkovi</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-slate-600 transition-colors hover:text-teal-500 dark:text-slate-400">
                  Početna
                </Link>
              </li>
              <li>
                <Link
                  href="/clinics"
                  className="text-slate-600 transition-colors hover:text-teal-500 dark:text-slate-400"
                >
                  Pronađi klinike
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 transition-colors hover:text-teal-500 dark:text-slate-400"
                >
                  O nama
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 transition-colors hover:text-teal-500 dark:text-slate-400"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Pravno</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 transition-colors hover:text-teal-500 dark:text-slate-400"
                >
                  Uslovi korištenja
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 transition-colors hover:text-teal-500 dark:text-slate-400"
                >
                  Politika privatnosti
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-slate-600 transition-colors hover:text-teal-500 dark:text-slate-400"
                >
                  Politika kolačića
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-slate-600 dark:text-slate-400">Email: info@mojezdravlje.ba</li>
              <li className="text-slate-600 dark:text-slate-400">Telefon: +387 33 123 456</li>
              <li className="text-slate-600 dark:text-slate-400">Sarajevo, Bosna i Hercegovina</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} MojeZdravlje. Sva prava zadržana.
        </div>
      </div>
    </footer>
  )
}