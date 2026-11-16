import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

const root =
  process.cwd();

describe(
  "AvatarNarrador AI - estructura crítica",
  () => {

    it(
      "reader existe",
      () => {
        expect(
          fs.existsSync(
            path.join(
              root,
              "app",
              "reader",
              "[slug]",
              "page.tsx",
            ),
          ),
        ).toBe(true);
      },
    );

    it(
      "BookUploadArea existe",
      () => {
        expect(
          fs.existsSync(
            path.join(
              root,
              "components",
              "BookUploadArea.tsx",
            ),
          ),
        ).toBe(true);
      },
    );

    it(
      "migración Supabase existe",
      () => {
        expect(
          fs.existsSync(
            path.join(
              root,
              "supabase",
              "migrations",
              "001_avatar_narrador.sql",
            ),
          ),
        ).toBe(true);
      },
    );

    it(
      "EPUB reader existe",
      () => {
        expect(
          fs.existsSync(
            path.join(
              root,
              "components",
              "EpubReader.tsx",
            ),
          ),
        ).toBe(true);
      },
    );
  },
);