const postResolvers = require('../resolvers/posts')
const userResolvers = require('../resolvers/users')
const commentReslovers = require('../resolvers/comments')

module.exports = {
    Post:{
        likeCount: (parent)=> parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query : {
        ...postResolvers.Query
    },
    Mutation : {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commentReslovers.Mutation
    },
    Subscription : {
        ...postResolvers.Subscription
    }
}