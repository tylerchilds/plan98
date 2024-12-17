import { web } from '@sillonious/solid/user'

export default async function performItemDeletion(_$, item) {
  const documentUrl = web.getDocumentUrl(item.url);

  await web.deleteDocument(documentUrl);
}

