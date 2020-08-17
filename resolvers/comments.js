const Post = require("../models/Post");
const { UserInputError, AuthenticationError } = require("apollo-server");
const checkAuth = require("../utils/check-auth");

module.exports = {
    Mutation:{
        createComment: async(_,{ postId, body}, context) =>{
            const user = checkAuth(context);
            if(body.trim() === ''){
                throw new UserInputError('Empty Comment', {
                    errors:{
                        username:'Comment body must not empty'
                    }
                })
            }

            const post = await Post.findById(postId);
            if(post){
                post.comments.unshift({
                    body,
                    username : user.username,
                    createdAt : new Date().toISOString()
                })
                await post.save();
                return post
            }else{
                throw new UserInputError('Post not found')
            }
        },
        deleteComment: async(_, {postId, commentId}, context)=>{
            const user = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex(c=>c.id === commentId);

                if(post.comments[commentIndex].username === user.username){
                    post.comments.splice(commentIndex,1)
                    await post.save();
                    return post;
                }else{
                    throw new AuthenticationError('Action not allowed')
                }
            }else{
                throw new UserInputError('Post not found')
            }
        },
        likePost: async(_, {postId}, context)=>{
            const user = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                if(post.likes.find(like=> like.username === user.username)){
                    post.likes = post.likes.filter(like => like.username !== user.username);
                }else{
                    post.likes.push({
                        username:user.username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save();
                return post;
            }else{
                throw new UserInputError('Post not found')
            }
        }
    }
}