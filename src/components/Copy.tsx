import { useState } from "react";
import { Check, Copy as CopyIcon } from "lucide-react";

// A value someone will paste somewhere else: a hash, a txid, an address.
const Copy = ({ value, label = "Copy" }: { value: string; label?: string }) => {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // Without clipboard access the value is still on screen to select.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 inline-flex align-middle text-[#8d8492] hover:text-[#f2abd0]"
      aria-label={done ? "Copied" : label}
      title={done ? "Copied" : label}
    >
      {done ? <Check size={13} aria-hidden="true" /> : <CopyIcon size={13} aria-hidden="true" />}
    </button>
  );
};

export default Copy;
