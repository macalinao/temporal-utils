{ pkgs, ... }:

{
  packages = with pkgs; [
    git
  ];

  dotenv.enable = true;
  languages.javascript = {
    enable = true;
    bun.enable = true;
  };

  git-hooks.hooks = {
    oxlint = {
      enable = true;
      name = "oxlint";
      entry = "./node_modules/.bin/oxlint --disable-nested-config --fix";
      files = "\\.(js|jsx|ts|tsx|cjs|mjs|cts|mts)$";
      language = "system";
      pass_filenames = false;
    };
    oxfmt = {
      enable = true;
      name = "oxfmt";
      entry = "./node_modules/.bin/oxfmt";
      files = "\\.(js|jsx|ts|tsx|cjs|mjs|cts|mts|json|jsonc|md|mdx|yaml|yml)$";
      language = "system";
      pass_filenames = false;
    };
    nixfmt.enable = true;
  };
}
