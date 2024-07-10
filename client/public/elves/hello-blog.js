import module from "@silly/tag";
import { PGlite } from "@electric-sql/pglite";

const $ = module('hello-blog', { posts: [] })

$.draw((target) => {
  mount(target)
  const { posts } = $.learn()

  return posts.map((post) => `
    ${post.author_name}
    ${post.blog_name}
    ${post.post_title}
  `).join('')
})

async function mount(target) {
  if(target.mounted) return
  target.mounted = true

  const db = new PGlite()
  console.log(await db.query(`
    create table if not exists blogs (
      id serial not null primary key,
      name text not null,
      viewCount int not null
    );

    create table if not exists authors (
      id serial primary key not null,
      "name" text
    );

    create table if not exists authors_blogs (
      author_id int not null references authors(id) on delete cascade,
      blog_id int not null references blogs(id) on delete cascade,
      unique(author_id, blog_id)
    );

    create table if not exists posts (
      id serial not null primary key,
      blog_id int not null references blogs(id) on delete cascade,
      title text not null,
      tags text[] not null default '{}'
    );
  `))

  console.log(await db.query(`
    INSERT INTO authors (name) VALUES ('Ty');
  `))

  console.log(await db.query(`
    INSERT INTO blogs (name, viewCount) VALUES ('Ty''s Blog', '0');
  `))

  const author = await db.query("SELECT name, id FROM authors;")
  const blog = await db.query("SELECT name, id FROM blogs;")

  console.log(author, blog)
  console.log(await db.query(`
    INSERT INTO authors_blogs (author_id, blog_id)
    VALUES ('${author[0].id}', '${blog[0].id}');
  `))

  console.log(await db.query(`
    INSERT INTO posts (blog_id, title) VALUES ('${blog[0].id}', 'Hello World');
  `))

  const result = await db.query(`
    SELECT
      authors.name AS author_name,
      blogs.name AS blog_name,
      posts.title AS post_title
    FROM
      authors_blogs
    JOIN
      authors ON authors_blogs.author_id = authors.id
    JOIN
      blogs ON authors_blogs.blog_id = blogs.id
    JOIN
      posts ON blogs.id = posts.blog_id;
  `);

  console.log("Joined result:", result);

  $.teach({ posts: result })
}
