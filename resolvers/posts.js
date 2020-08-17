const Post = require("../models/Post")
const checkAuth = require('../utils/check-auth');
const { AuthenticationError } = require("apollo-server");

module.exports = {
    Query : {
        async getPosts() {
            try{
                const posts = await Post.find().sort({createdAt: -1});
                return posts
            }
            catch(err){
                throw new Error(err)
            }
        },
        async getPost(_,{ postId }){
            try{
                const post = await Post.findById(postId)
                if(post){
                    return post
                }else{
                    throw new Error('Post not found');
                }
            }catch(err){
                throw new Error(err)
            }
        }
    },
    Mutation : {
        async createPost(_, { body }, context){
            const user = checkAuth(context);

            if(body.trim() === ''){
                return new Error('Post body must not be empty')
            }

            const newpost = new Post({
                body,
                user: user.id,
                username : user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newpost.save();
            
            context.pubsub.publish('NEW_POST',{
                newPost:post
            });
            return post
        },
        async deletePost(_, {postId}, context){
            const user = checkAuth(context);

            try{
                const post = await Post.findById(postId)
                if( user.username === post.username){
                    await post.delete();
                    return 'Post deleted successfully'
                }else{
                    throw new AuthenticationError('Action not allowed');
                }
            }catch(err){
                throw new Error(err)
            }
        }
    },
    Subscription:{
        newPost:{
            subscribe: (_,__,{ pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}