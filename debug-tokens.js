import _ from "lodash";
import { register, getTransforms } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";

console.log("Registering transforms...");
register(StyleDictionary);

console.log("Getting transforms...");
const transforms = getTransforms();
console.log("Transforms:", transforms);

// Let's check if any of these transforms are not functions
transforms.forEach((transformName, index) => {
  const transform = StyleDictionary.transform[transformName];
  if (transform) {
    console.log(`Transform ${index}: ${transformName}`, typeof transform.transformer);
    if (typeof transform.transformer !== 'function') {
      console.error(`Transform ${transformName} does not have a function transformer!`);
    }
  } else {
    console.error(`Transform ${transformName} not found in StyleDictionary!`);
  }
});

console.log("Done.");