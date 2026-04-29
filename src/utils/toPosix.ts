import { sep } from "node:path";

export function toPosix(p: string | null): string | null {
    return p ? p.split(sep).join("/") : p;
}
