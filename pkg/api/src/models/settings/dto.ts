import { z } from "zod";

export enum AuthTypes {
  Standard = 1,
  Fast = 2,
}

export const defaultSettingsId = "ff4e5493-4e4f-4b9d-ae07-e0a578f08420";
export const SettingsDTO = z.object({
  plexPopular: z.boolean().default(false),
  authType: z.nativeEnum(AuthTypes).default(AuthTypes.Standard),
  initialCache: z.boolean().default(false),
});
export type Settings = z.infer<typeof SettingsDTO>;

export const MakeSettings = (settings?: Partial<Settings>): Settings => {
  const defaults = SettingsDTO.parse({});
  return { ...defaults, ...settings };
};
