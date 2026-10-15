import { useEffect, useState, useCallback } from "react";
import { api } from "./api";
export function useResource(path, interval = 0) {
  const [state, setState] = useState({ path: "", data: null, error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    if (!path) return;
    let active = true;
    const load = () =>
      api(path)
        .then((data) => {
          if (active) setState({ path, data, error: "" });
        })
        .catch((e) => {
          if (active) setState({ path, data: null, error: e.message });
        });
    load();
    const timer = interval ? setInterval(load, interval) : null;
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [path, revision, interval]);
  return {
    data: state.path === path ? state.data : null,
    error: state.path === path ? state.error : "",
    loading: Boolean(path) && state.path !== path,
    reload,
  };
}
