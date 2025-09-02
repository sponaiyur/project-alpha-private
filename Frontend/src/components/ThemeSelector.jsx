import { useState, useEffect } from "react";

export default function ThemeSelector() {
  const [theme, setTheme] = useState("retro"); // default theme

  // Optional: persist in localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="select select-bordered"
    >
      <option value="retro">Retro</option>
      <option value="light">Light</option>
      <option value="black">Black</option>
    </select>
  );
}
