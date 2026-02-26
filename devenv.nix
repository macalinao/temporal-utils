{ pkgs, ... }:

{
  packages = with pkgs; [
    nixfmt-rfc-style
    git
    biome
  ];

  dotenv.enable = true;
  languages.javascript = {
    enable = true;
    bun.enable = true;
  };

  git-hooks.hooks = {
    biome = {
      enable = true;
      name = "biome check";
      entry = "${pkgs.biome}/bin/biome check --write --unsafe";
      files = "\\.(js|jsx|ts|tsx|cjs|mjs|cts|mts|json|jsonc)$";
      language = "system";
    };
    nixfmt.enable = true;
    prettier = {
      enable = true;
      types_or = [
        "markdown"
        "yaml"
      ];
    };
  };
}
