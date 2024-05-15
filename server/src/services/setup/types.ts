export type TestMediaServerProps = {
  protocol: string;
  host: string;
  port: number;
  token: string;
};

export type CreateMediaServerProps = {
  protocol: string;
  host: string;
  port: number;
  token: string;
};

export type CreateAdminUserProps = {
  token: string;
  password: string;
  ip: string;
};

export type GetPlexUserProps = {
  token: string;
};
