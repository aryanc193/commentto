export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#1f2937] py-6 text-center text-sm text-[var(--subtle)]">
      <span>
        Built with curiosity by{" "}
        <a
          href="https://itsugo-portfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-400 underline-offset-4 hover:underline"
        >
          Aryan
        </a>{" "}
        •{" "}
        <a
          href="https://github.com/aryanc193/commentto"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 underline-offset-4 hover:underline"
        >
          GitHub
        </a>
      </span>
    </footer>
  );
}
