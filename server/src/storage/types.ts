export interface FileInfo {
  fileName: string;
  personId: string;
}

export interface PersonInfo {
  personId: string;
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
}
