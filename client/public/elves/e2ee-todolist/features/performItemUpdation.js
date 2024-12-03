import { web } from '@sillonious/solid/user'

export default async function performItemUpdation(_$, item) {
  const documentUrl = web.getDocumentUrl(item.url);

  await web.updateDocument(documentUrl, `
    DELETE DATA {
      <#it>
        <https://schema.org/actionStatus>
        <https://schema.org/${item.completed ? 'PotentialActionStatus' : 'CompletedActionStatus'}> .
    } ;
    INSERT DATA {
      <#it>
        <https://schema.org/actionStatus>
        <https://schema.org/${item.completed ? 'CompletedActionStatus' : 'PotentialActionStatus'}> .
    }
  `);
}
