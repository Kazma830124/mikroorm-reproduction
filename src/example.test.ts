import { Entity, ManyToOne, MikroORM, PrimaryKey, Property, QueryOrder } from '@mikro-orm/postgresql';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  age!: number;
}

@Entity()
export class Book {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @ManyToOne(() => User)
  owner!: User;
}

@Entity({
  expression: `
     SELECT "user".id, "user".name, "user".age, COUNT(b.id) AS book_count
    FROM "user"
    LEFT JOIN "book" b ON b.owner_id = "user".id
    GROUP BY "user".id
  `,
})
export class UserBookSummary {
  @Property()
  id!: number;

  @Property()
  name!: string;

  @Property()
  age!: number;

  @Property()
  bookCount!: number;
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    entities: [User, Book, UserBookSummary],
    dbName: "test",
    host: "localhost",
    port: 27017,
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
  const em = orm.em
  const users = [
    em.create(User, { name: 'Alice', age: 30 }),
    em.create(User, { name: 'Bob', age: 24 }),
    em.create(User, { name: 'Charlie', age: 28 }),
    em.create(User, { name: 'David', age: 35 }),
    em.create(User, { name: 'Eve', age: 22 })
  ];
  await em.persistAndFlush(users);
  
  const books = [
    em.create(Book, { title: 'The Great Gatsby', owner: users[0] }),
    em.create(Book, { title: '1984', owner: users[1] }),
    em.create(Book, { title: 'Brave New World', owner: users[2] }),
    em.create(Book, { title: 'To Kill a Mockingbird', owner: users[3] }),
    em.create(Book, { title: 'Moby Dick', owner: users[4] }),
  ];
  await em.persistAndFlush(books);
  
  });

afterAll(async () => {
  await orm.close(true);
});

test('findByCursor with virtual entity', async () => {
  const cursor = await orm.em.findByCursor(UserBookSummary,{},{orderBy:{id:QueryOrder.ASC}, first:3})
  expect(cursor.length).toBe(3);
});
