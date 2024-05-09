import module from "@silly/tag"
import PocketBase from "pocketbase"

const $ = module('oauth-github')

const pb = new PocketBase('https://pocketbase.io');

export async function connect(target) {
  if(target.dataset.base) return
  const src = target.getAttribute('src') || plan98.database || "http://localhost:8090"
  target.dataset.base = src
  bases[src] = new PocketBase(src)
  const records = await bases[src].collection('posts').getFullList({
    sort: '-created',
  });
}


$.when('click', '[data-connect]', async () => {
	const authData = await pb.collection('users').authWithOAuth2({ provider: 'github' });
})

$.when('click', '[data-diconnect]', async () => {
	pb.authStore.clear();
})

// after the above you can also access the auth data from the authStore
console.log(pb.authStore.isValid);
console.log(pb.authStore.token);
console.log(pb.authStore.model.id);

// "logout" the last authenticated model

