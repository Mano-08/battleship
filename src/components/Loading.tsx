import React from "react";

function Loading() {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="h-2 w-2 bg-black rounded-full animate-bounce"></div>
      <div className="h-2 w-2 bg-black animation-delay-167 rounded-full animate-bounce"></div>
      <div className="h-2 w-2 bg-black animation-delay-334 rounded-full animate-bounce"></div>
    </div>
  );
}

export default Loading;
