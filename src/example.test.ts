import { BaseEntity, Embeddable, Embedded, Entity, MikroORM, ObjectId, Opt, PrimaryKey, Property, SerializedPrimaryKey, Unique } from '@mikro-orm/mongodb';

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    clientUrl:'mongodb://admin:password@localhost:21111/',
    dbName:'repro-test',
    entities: [User],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.em.getCollection(User).indexes().then(console.log)
  await orm.schema.refreshDatabase()
  await orm.em.getCollection(User).indexes().then(console.log)
  await orm.schema.dropIndexes()
});

afterAll(async () => {
  await orm.close(true);
});

export default class Base extends BaseEntity {
  @PrimaryKey()
    _id: ObjectId = new ObjectId();

  @SerializedPrimaryKey()
    id!: string;

  constructor() {
    super();
  }
}

@Embeddable()
class UserInfo {
  @Property()
  role!:string

  @Property()
  id!:string

}


@Unique({properties:['info_id','info_role']})
@Entity()
class User extends Base{
  
  @Embedded(()=>UserInfo,{object:true})
  info:Opt<UserInfo>

  constructor() {
    super()
    this.info = {
      role:'ADMIN',
      id:crypto.randomUUID()
    }
  }
}


test('for passing jest', async ()=>{})
