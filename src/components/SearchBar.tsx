import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ autoFocus = false }: { autoFocus?: boolean }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (value) navigate(`/search/${encodeURIComponent(value)}`);
  };
  return (
    <form className="scan-search" onSubmit={submit} role="search">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Block height, block hash or short address (zqtest2…)"
        aria-label="Search the chain"
        spellCheck={false}
        autoFocus={autoFocus}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
