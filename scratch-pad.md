table: users

email: VARCHAR(255)
password: VARCHAR(255)

sequelize model:create --name user --attributes email:string,password:string
sequelize model:create --name comment --attributes content:string,userId:integer,musicId:integer

sequelize model:create --name music --attributes song:string,album:string,artist:string,userId:integer,commentId:integer
sequelize model:create --name musicUsers --attributes musicId:integer,userId:integer

sequelize model:create --name commentsUsers --attributes commentId:integer,userId:integer

//user.add.????
//user.remove.???
