import { useContext } from "react";
import { NillionContext } from "@/context/NillionContext";

export function useNillion() {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error("useNillion must be used within a NillionProvider");
  }
  return context;
}

