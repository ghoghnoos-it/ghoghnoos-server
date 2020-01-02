import {
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLBoolean,
    GraphQLObjectType,
    GraphQLSchema,
} from 'graphql';
import controller from './controller';

const types = { 'pagination': null, 'post': null, 'internet': null, 'project': null, 'faq': null, 'ticket': null, 'user': null };

types['pagination'] = type => {
    return new GraphQLObjectType({
        name: "Page" + type,
        description: "Page",
        fields: {
            data: { type: GraphQLList(types[type]) },
            hasNextPage: { type: GraphQLBoolean }
        }
    })
};

types['post'] = new GraphQLObjectType({
    name: 'Post',
    fields: {
        id: { type: GraphQLID },
        photo: { type: GraphQLString },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        tags: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString }
    }
});


types['internet'] = new GraphQLObjectType({
    name: 'Internet',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        category: { type: GraphQLString },
        speed: { type: GraphQLInt },
        time: { type: GraphQLInt },
        volume: { 
            type: new GraphQLObjectType({
                name: 'Volume',
                fields: {
                    in: { type: GraphQLInt },
                    out: { type: GraphQLInt }
                }
            })
        },
        each: { type: GraphQLInt },
        price: { type: GraphQLInt },
        index: { type: GraphQLBoolean }
    }
});

types['project'] = new GraphQLObjectType({
    name: 'Project',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        details: { type: GraphQLString },
        category: { type: GraphQLString },
        url: { type: GraphQLString }
    }
});

types['faq'] = new GraphQLObjectType({
    name: 'Faq',
    fields: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        star: { type: GraphQLBoolean }
    }
});

types['ticket'] = new GraphQLObjectType({
    name: 'Ticket',
    fields: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        strange: { type: GraphQLInt },
        department: { type: GraphQLString },
        status: { type: GraphQLString },
        createdAt: { type: GraphQLString },
    }
});

types['user'] = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLID },
        name: {
            type: new GraphQLObjectType({
                name: 'Name',
                fields: {
                    first: { type: GraphQLString },
                    last: { type: GraphQLString }
                }
            })
        },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        permission: { type: GraphQLString },
        verified: { type: GraphQLBoolean }
    }
})

export default {
    'public': new GraphQLSchema({
        query: new GraphQLObjectType({
            name: "PublicQueries",
            fields: {
                posts: {
                    type: types['pagination']('post'),
                    args: {
                        page: { type: GraphQLInt },
                        all: { type: GraphQLBoolean }
                    },
                    resolve: async(_, args)=>{
                        let data = await controller.graph.getAll('post', {}, args['all']==true?-1:args['page'] || 0);
                        return{
                            data,
                            hasNextPage: args['all']==true?false:data.length == 10
                        }
                    }
                },
                post: {
                    type: types['post'],
                    args: {
                        id: { type: GraphQLString }
                    },
                    resolve: async(_, args)=>{
                        if(args['id']){
                            return await controller.graph.getOne('post', { '_id': args['id']});
                        } else {
                            return null;
                        }
                    }
                },
                internet: {
                    type: GraphQLList(types['internet']),
                    args: {
                        index: { type: GraphQLBoolean }
                    },
                    resolve: async(_, args)=>{
                        return await controller.graph.getAll('internet', args, -1);
                    }
                },
                projects: {
                    type: GraphQLList(types['project']),
                    resolve: async()=>{
                        return await controller.graph.getAll('project', {}, -1);
                    }
                },
                faqs: {
                    type: GraphQLList(types['faq']),
                    args: {
                        star: { type: GraphQLBoolean }
                    },
                    resolve: async(_, args)=>{
                        return await controller.graph.getAll('faq', args, -1);
                    }
                }
            }
        })
    }),
    'private': new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'PrivateQueries',
            fields: {
                tickets: {
                    type: GraphQLList(types['ticket']),
                    args: {
                        strange: { type: GraphQLInt },
                        department: { type: GraphQLString },
                        status: { type: GraphQLInt }
                    },
                    resolve: async(_, args)=>{
                        return await controller.graph.getAll('ticket', args, -1);
                    }
                },
                users: {
                    type: GraphQLList(types['user']),
                    resolve: async(_, args)=>{
                        return await controller.graph.getAll('user', { 'permission': { $ne: 'user' } }, -1);
                    }
                }
            }
        })
    })
}