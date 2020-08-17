const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose')
const { MONGODBURI } = require('./config')
const typeDefs = require('./schema/typeDef')
const resolvers = require('./resolvers/index')

const pubsub = new PubSub();

const PORT = process.env.PORT || 4000

const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context :({req})=> ({req, pubsub}) 
});
mongoose
    .connect(MONGODBURI, {useNewUrlParser : true, useUnifiedTopology: true})
    .then(()=>{
        console.log("Connected to MongoDB")
    })
    .catch(err=>{
        console.log(err)
    })

server.listen(PORT).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});