import { createContext, type ReactNode, useContext, useState } from "react";

interface ILogContext {
  logs: string[];
  log: (message: string, data?: unknown) => void;
  clearLogs: (initialMessage?: string) => void;
}

const LogContext = createContext<ILogContext | null>(null);

const createLogEntry = (message: string) => `[${new Date().toLocaleTimeString("en-GB")}] ${message}`;

export const LogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string, data?: unknown) => {
    const entry = createLogEntry(message);
    const fullLog = data ? `${entry}\n${JSON.stringify(data, null, 2)}` : entry;
    setLogs((prev) => [...prev, fullLog]);
    console.log(entry, data);
  };

  const clearLogs = (initialMessage?: string) => {
    setLogs(initialMessage ? [createLogEntry(initialMessage)] : []);
  };

  return (
    <LogContext.Provider
      value={{
        logs,
        log,
        clearLogs,
      }}
    >
      {children}
    </LogContext.Provider>
  );
};

export const useLogContext = (): ILogContext => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogContext must be used within a LogProvider");
  }
  return context;
};

