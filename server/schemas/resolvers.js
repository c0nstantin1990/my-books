const { User, Book } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not logged in");
      }
      const userData = await User.findById(context.user._id).select(
        "-__v -password"
      );
      return userData;
    },
  },
  Mutation: {
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { book }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: book } },
        { new: true }
      );

      return updatedUser;
    },
    removeBook: async (_, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

module.exports = resolvers;
