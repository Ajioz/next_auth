import "./globals.css";

export const metadata = {
  title: "Next Auth",
  description: "Next.js Authentication",
};

export default function AuthRootLayout({ children }) {
  return (
    <html lang="en">
      <header>
        <p>Welcome Back</p>
        <form action={"/"}>
          <button>Logout</button>
        </form>
      </header>
      <body>{children}</body>
    </html>
  );
}
