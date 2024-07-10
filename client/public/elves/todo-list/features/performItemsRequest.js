import { web } from '@sillonious/solid/user'

export default async function performItemsRequest($) {
  const { itemsContainerUrl } = $.learn()
  // In a real application, you shouldn't hard-code the path to the container like we're doing here.
  // Read more about this in the comments on the performTaskCreation function.

  const containmentQuads = await web.readDocument(itemsContainerUrl, null, { ldp: 'contains' });

  if (!containmentQuads)
    return [];

  const items = [];
  for (const containmentQuad of containmentQuads) {
    const [typeQuad] = await web.readDocument(containmentQuad.object.value, null, { rdf: 'type' }, { schemaorg: 'Action' });

    if (!typeQuad) {
      // Not a Task, we can ignore this document.

      continue;
    }

    const taskUrl = typeQuad.subject.value;
    const [descriptionQuad] = await web.readDocument(containmentQuad.object.value, `<${taskUrl}>`, { schemaorg: 'description' });
    const [statusQuad] = await web.readDocument(containmentQuad.object.value, `<${taskUrl}>`, { schemaorg: 'actionStatus' });

    items.push({
      url: taskUrl,
      description: descriptionQuad?.object.value || '-',
      completed: statusQuad?.object.value === 'https://schema.org/CompletedActionStatus',
    });
  }

  return items;
}

