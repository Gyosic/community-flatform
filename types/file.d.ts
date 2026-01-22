import { FileType } from "@/lib/zod/file";

declare global {
  interface File extends FileType {}
}
