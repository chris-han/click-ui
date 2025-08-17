import _ from "lodash";
import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";

register(StyleDictionary);
const themes = ["classic", "dark", "light"];

function generateThemeFromDictionary(dictionary, valueFunc = (value) => value) {
  const theme = {};
  dictionary.allTokens.forEach((token) => {
    _.setWith(theme, token.name, valueFunc(token.value), Object)
  });
  return theme;
}

StyleDictionary.registerTransform({
  type: "name",
  name: "name/cti/dot",
  transform: (token, options) => {
    if (options.prefix && options.prefix.length) {
      return [options.prefix].concat(token.path).join(".");
    } else {
      return token.path.join(".");
    }
  }
});

StyleDictionary.registerFormat({
  name: "ThemeFormat",
  format: function ({ dictionary, platform, options, file }) {
    const theme = generateThemeFromDictionary(dictionary);
    return JSON.stringify(theme, null, 2);
  }
});

StyleDictionary.registerFormat({
  name: "TypescriptFormat",
  format: function ({ dictionary, platform, options, file }) {
    const theme = generateThemeFromDictionary(dictionary, (value) => typeof value);

    return `
      export interface Theme ${JSON.stringify(theme, null, 2).replaceAll("\"string\"", "string").replaceAll("\"number\"", "number")}
    `
  }
});

const sd = new StyleDictionary({
  source: [`./tokens/**/!(${themes.join("|*.")}).json`],
  platforms: {
    css: {
      transforms: ["ts/descriptionToComment", "ts/resolveMath", "ts/size/px", "ts/opacity", "ts/size/lineheight", "ts/typography/fontWeight", "ts/color/modifiers", "ts/color/css/hexrgba", "ts/size/css/letterspacing", "ts/shadow/innerShadow", "name/kebab"],
      buildPath: "build/css/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    js: {
      transforms: ["ts/descriptionToComment", "ts/resolveMath", "ts/size/px", "ts/opacity", "ts/size/lineheight", "ts/typography/fontWeight", "ts/color/modifiers", "ts/color/css/hexrgba", "ts/size/css/letterspacing", "ts/shadow/innerShadow", "name/cti/dot"],
      buildPath: "src/styles/",
      files: [
        {
          destination: "variables.json",
          format: "ThemeFormat",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    ts: {
      transforms: ["ts/descriptionToComment", "ts/resolveMath", "ts/size/px", "ts/opacity", "ts/size/lineheight", "ts/typography/fontWeight", "ts/color/modifiers", "ts/color/css/hexrgba", "ts/size/css/letterspacing", "ts/shadow/innerShadow", "name/cti/dot"],
      buildPath: "src/styles/",
      files: [
        {
          destination: "types.ts",
          format: "TypescriptFormat",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();

themes.forEach(async theme => {
  const themeSd = new StyleDictionary({
    include: [`./tokens/**/!(${themes.join("|*.")}).json`],
    source: [`./tokens/**/${theme}.json`],
    platforms: {
      css: {
        transforms: ["ts/descriptionToComment", "ts/resolveMath", "ts/size/px", "ts/opacity", "ts/size/lineheight", "ts/typography/fontWeight", "ts/color/modifiers", "ts/color/css/hexrgba", "ts/size/css/letterspacing", "ts/shadow/innerShadow", "name/kebab"],
        buildPath: "build/css/",
        files: [
          {
            destination: `variables.${theme}.css`,
            format: "css/variables",
            filter: token => token.filePath.indexOf(`${theme}`) > -1,
            options: {
              outputReferences: true,
            },
          },
        ],
      },
      js: {
        transforms: ["ts/descriptionToComment", "ts/resolveMath", "ts/size/px", "ts/opacity", "ts/size/lineheight", "ts/typography/fontWeight", "ts/color/modifiers", "ts/color/css/hexrgba", "ts/size/css/letterspacing", "ts/shadow/innerShadow", "name/cti/dot"],
        buildPath: "src/styles/",
        files: [
          {
            destination: `variables.${theme}.json`,
            format: "ThemeFormat",
            filter: token => token.filePath.indexOf(`${theme}`) > -1,
            options: {
              outputReferences: true,
            },
          },
        ],
      },
    },
  });
  
  await themeSd.cleanAllPlatforms();
  await themeSd.buildAllPlatforms();
});
