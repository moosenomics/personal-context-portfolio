export interface FileInfo {
  fileName: string;
  personId: string;
}

export interface PersonInfo {
  personId: string;
}

export interface FileInfoWithDate {
  fileName: string;
  personId: string;
  lastModified: string; // ISO 8601
}

export interface StorageProvider {
  /** Read a single file. Throws if person or file not found. */
  read(personId: string, fileName: string): Promise<string>;

  /** Read all portfolio files for a person (excludes _ prefixed files). Returns map of fileName → content. */
  readAll(personId: string): Promise<Map<string, string>>;

  /** List portfolio files for a person (excludes _ prefixed files). */
  listFiles(personId: string): Promise<FileInfo[]>;

  /** List all people in storage. Reads directory on every call — no caching. */
  listPeople(): Promise<PersonInfo[]>;

  /** Read _roles.md for a person and return their role tags. Returns empty array if missing. */
  getRoles(personId: string): Promise<string[]>;

  /** Check if a person exists in storage. */
  exists(personId: string): Promise<boolean>;

  /** Write content to a file. Creates the file if it doesn't exist. */
  writeFile(personId: string, fileName: string, content: string): Promise<void>;

  /** List portfolio files with last-modified dates (excludes _ prefixed files). */
  listFilesWithDates(personId: string): Promise<FileInfoWithDate[]>;

  /** Get mtime for a single file. Returns null if file not found. */
  getFileMtime(personId: string, fileName: string): Promise<string | null>;

  /** Append a line to a file (for JSON-lines logs). Creates the file if it doesn't exist. */
  appendFile(personId: string, fileName: string, content: string): Promise<void>;
}
