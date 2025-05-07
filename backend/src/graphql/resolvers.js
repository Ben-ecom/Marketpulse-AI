// GraphQL resolvers voor MarketPulse AI
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Project from '../models/project.js';
import RedditData from '../models/redditData.js';
import AmazonReview from '../models/amazonReview.js';
import MarketSize from '../models/marketSize.js';
import PainPoint from '../models/painPoint.js';
import Desire from '../models/desire.js';
import MarketingInsight from '../models/marketingInsight.js';
import { startDataCollectionJob } from '../jobs/dataCollection.js';
import { generateInsightsJob } from '../jobs/insightGeneration.js';
import { logger } from '../utils/logger.js';

const resolvers = {
  // Query resolvers
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Gebruiker bestaat niet');
      }

      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error('Wachtwoord is onjuist');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return {
        token,
        userId: user.id,
        expiresIn: 3600
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  },

  user: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error('Gebruiker niet gevonden');
      }

      return {
        ...user._doc,
        id: user.id,
        password: null
      };
    } catch (error) {
      logger.error(`Gebruiker ophalen error: ${error.message}`);
      throw error;
    }
  },

  projects: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const projects = await Project.find({ userId: req.userId });
      return projects.map(project => ({
        ...project._doc,
        id: project.id
      }));
    } catch (error) {
      logger.error(`Projecten ophalen error: ${error.message}`);
      throw error;
    }
  },

  project: async ({ id }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const project = await Project.findOne({ _id: id, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      return {
        ...project._doc,
        id: project.id
      };
    } catch (error) {
      logger.error(`Project ophalen error: ${error.message}`);
      throw error;
    }
  },

  redditData: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      // Controleer of project bestaat en van de gebruiker is
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      const redditData = await RedditData.find({ projectId });
      return redditData.map(data => ({
        ...data._doc,
        id: data.id
      }));
    } catch (error) {
      logger.error(`Reddit data ophalen error: ${error.message}`);
      throw error;
    }
  },

  amazonReviews: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      // Controleer of project bestaat en van de gebruiker is
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      const amazonReviews = await AmazonReview.find({ projectId });
      return amazonReviews.map(review => ({
        ...review._doc,
        id: review.id
      }));
    } catch (error) {
      logger.error(`Amazon reviews ophalen error: ${error.message}`);
      throw error;
    }
  },

  marketSize: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      // Controleer of project bestaat en van de gebruiker is
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      const marketSizes = await MarketSize.find({ projectId });
      return marketSizes.map(size => ({
        ...size._doc,
        id: size.id
      }));
    } catch (error) {
      logger.error(`Marktgrootte ophalen error: ${error.message}`);
      throw error;
    }
  },

  painPoints: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      // Controleer of project bestaat en van de gebruiker is
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      const painPoints = await PainPoint.find({ projectId });
      return painPoints.map(point => ({
        ...point._doc,
        id: point.id
      }));
    } catch (error) {
      logger.error(`Pijnpunten ophalen error: ${error.message}`);
      throw error;
    }
  },

  desires: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      // Controleer of project bestaat en van de gebruiker is
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      const desires = await Desire.find({ projectId });
      return desires.map(desire => ({
        ...desire._doc,
        id: desire.id
      }));
    } catch (error) {
      logger.error(`Verlangens ophalen error: ${error.message}`);
      throw error;
    }
  },

  marketingInsights: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      // Controleer of project bestaat en van de gebruiker is
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      const insights = await MarketingInsight.find({ projectId });
      return insights.map(insight => ({
        ...insight._doc,
        id: insight.id
      }));
    } catch (error) {
      logger.error(`Marketing inzichten ophalen error: ${error.message}`);
      throw error;
    }
  },

  // Mutation resolvers
  createUser: async ({ userInput }) => {
    try {
      const existingUser = await User.findOne({ email: userInput.email });
      if (existingUser) {
        throw new Error('Gebruiker bestaat al');
      }

      const hashedPassword = await bcrypt.hash(userInput.password, 12);
      const user = new User({
        email: userInput.email,
        password: hashedPassword,
        name: userInput.name
      });

      const result = await user.save();
      return {
        ...result._doc,
        id: result.id,
        password: null
      };
    } catch (error) {
      logger.error(`Gebruiker aanmaken error: ${error.message}`);
      throw error;
    }
  },

  createProject: async ({ projectInput }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const project = new Project({
        ...projectInput,
        userId: req.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const result = await project.save();
      return {
        ...result._doc,
        id: result.id
      };
    } catch (error) {
      logger.error(`Project aanmaken error: ${error.message}`);
      throw error;
    }
  },

  updateProject: async ({ id, projectInput }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const project = await Project.findOne({ _id: id, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      project.name = projectInput.name;
      project.category = projectInput.category;
      project.productDetails = projectInput.productDetails;
      project.researchScope = projectInput.researchScope;
      project.competitors = projectInput.competitors;
      project.updatedAt = new Date().toISOString();

      const result = await project.save();
      return {
        ...result._doc,
        id: result.id
      };
    } catch (error) {
      logger.error(`Project bijwerken error: ${error.message}`);
      throw error;
    }
  },

  deleteProject: async ({ id }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const project = await Project.findOne({ _id: id, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      // Verwijder ook alle gerelateerde data
      await RedditData.deleteMany({ projectId: id });
      await AmazonReview.deleteMany({ projectId: id });
      await MarketSize.deleteMany({ projectId: id });
      await PainPoint.deleteMany({ projectId: id });
      await Desire.deleteMany({ projectId: id });
      await MarketingInsight.deleteMany({ projectId: id });

      await Project.findByIdAndDelete(id);
      return true;
    } catch (error) {
      logger.error(`Project verwijderen error: ${error.message}`);
      throw error;
    }
  },

  startDataCollection: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      // Start dataverzameling als achtergrondtaak
      await startDataCollectionJob(projectId);
      return true;
    } catch (error) {
      logger.error(`Dataverzameling starten error: ${error.message}`);
      throw error;
    }
  },

  generateInsights: async ({ projectId }, req) => {
    if (!req.isAuth) {
      throw new Error('Niet geauthenticeerd');
    }

    try {
      const project = await Project.findOne({ _id: projectId, userId: req.userId });
      if (!project) {
        throw new Error('Project niet gevonden');
      }

      // Start inzichtgeneratie als achtergrondtaak
      await generateInsightsJob(projectId);
      return true;
    } catch (error) {
      logger.error(`Inzichtgeneratie starten error: ${error.message}`);
      throw error;
    }
  }
};

export default resolvers;
