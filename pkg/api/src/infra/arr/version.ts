export const parseVersion = (version: string): ArrVersion | null => {
  const match = version.replace(/[^0-9.]/g, '').match(/[0-9]*\.|[0-9]+/g); // eslint-disable-line max-len
  if (!match) {
    return null;
  }

  return new ArrVersion(
    parseInt(match[0], 10) || 0,
    parseInt(match[1], 10) || 0,
    parseInt(match[2], 10) || 0,
    parseInt(match[3], 10) || 0,
  );
};

export class ArrVersion {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public build: number,
  ) {}

  public compare(version: string): boolean {
    const v = parseVersion(version);
    if (!v) {
      return false;
    }

    if (this.major !== v.major) {
      return this.major > v.major ? true : false;
    }

    if (this.minor !== v.minor) {
      return this.minor > v.minor ? true : false;
    }

    if (this.patch !== v.patch) {
      return this.patch > v.patch ? true : false;
    }

    if (this.build !== v.build) {
      return this.build > v.build ? true : false;
    }

    return true;
  }

  public toString(): string {
    return `${this.major}.${this.minor}.${this.patch}${this.build}`;
  }
}
