import { web } from '@sillonious/solid/user'

export default async function performItemCreation($, flags) {
  const { description } = flags
  const { itemsContainerUrl } = $.learn();
  // Data discovery mechanisms are still being defined in Solid, but so far it is clear that
  // applications should not hard-code the url of their containers like we are doing in this
  // example.
  //
  // In a real application, you should use one of these two alternatives:
  //
  // - The Type index. This is the one that most applications are using in practice today:
  //   https://github.com/solid/solid/blob/main/proposals/data-discovery.md#type-index-registry
  //
  // - SAI, or Solid App Interoperability. This one is still being defined:
  //   https://solid.github.io/data-interoperability-panel/specification/

  const documentUrl = await web.createDocument(itemsContainerUrl, `
    @prefix schema: <https://schema.org/> .

    <#it>
      a schema:Action ;
      schema:actionStatus schema:PotentialActionStatus ;
      schema:description "${web.escapeText(description)}" .
  `);

  return { url: `${documentUrl}#it`, completed: false, description };
}

