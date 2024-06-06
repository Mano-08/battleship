import React from "react";

function Button({ text, className }: { text: string; className: string }) {
  return <button className={className}>{text}</button>;
}

export default Button;
