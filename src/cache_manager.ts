// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function generateUUID(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;

}

const existsSync = (filename: string): boolean => {
    try {
      Deno.statSync(filename);
      // successful, file or directory must exist
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // file or directory does not exist
        return false;
      } else {
        // unexpected error, maybe permissions, pass it along
        throw error;
      }
    }
  };
  

export class CacheManager {
    constructor(private revalidateTime: number, private cacheFile: string) {}
    
    // Reason to use /tmp/:
    // https://github.com/orgs/vercel/discussions/314
    get cacheFilePath(): string {
        return `/tmp/${this.cacheFile}`;
    }
    get cacheFileExists(): boolean {
        return existsSync(this.cacheFilePath);
    }

    get cacheFileLastModified(): Date | null {
        if (!this.cacheFileExists) {
            return null;
        }
        const fileInfo = Deno.statSync(this.cacheFilePath);
        return fileInfo.mtime ?? null;
    }

    get cacheFileLastModifiedGetTime(): number | null {
        const lastModified = this.cacheFileLastModified;
        if (lastModified === null) {
            return null;
        }
        return lastModified.getTime();
    }

    get isCacheValid(): boolean {
        if (this.cacheFileLastModifiedGetTime === null) {
            return false;
        }
        const currentTime = new Date().getTime();
        return currentTime - this.cacheFileLastModifiedGetTime < this.revalidateTime;
    }

    async save (response: Response) {
        if(response === null) return

        // Prevent TypeError: ReadableStream is locked
        try {
            if(!existsSync(this.cacheFilePath)) {
                Deno.createSync(this.cacheFilePath);
            }
    
            const text = await response.text()
            const data = new TextEncoder().encode(text)
        
            Deno.writeFileSync(this.cacheFilePath, data, { create: true });
        } catch {

        }
    }
}