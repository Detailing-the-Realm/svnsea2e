/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [

    // Actor Sheet Partials
    'systems/svnsea2e/templates/actors/parts/actor-traits.html',
    'systems/svnsea2e/templates/actors/parts/actor-advantages.html',
    'systems/svnsea2e/templates/actors/parts/actor-backgrounds.html',
    'systems/svnsea2e/templates/actors/parts/actor-sorcery.html',

     // Item Sheet Partials
    'systems/svnsea2e/templates/items/parts/item-action.html',
    'systems/svnsea2e/templates/items/parts/item-activation.html',
    'systems/svnsea2e/templates/items/parts/item-description.html'
  ]

  // Load the template parts
  return loadTemplates(templatePaths)
}