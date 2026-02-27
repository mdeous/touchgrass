export function Footer() {
  return (
    <footer className="border-t bg-card py-4 text-center text-sm text-muted-foreground">
      <div className="mx-auto max-w-screen-2xl px-4">
        <p>
          TouchGrass &mdash; Open source French PTO optimizer &middot;{' '}
          <a
            href="https://github.com/touchgrass"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            GitHub
          </a>{' '}
          &middot; MIT License
        </p>
      </div>
    </footer>
  )
}
