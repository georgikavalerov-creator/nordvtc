import { CI, type CIName } from "./icons-client";

/** Icône duotone utilisable dans les composants client (sous-ensemble léger). */
export default function IconC({ name, size = 22 }: { name: CIName; size?: number }) {
  return <svg className="ico-d" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: CI[name] }} />;
}
